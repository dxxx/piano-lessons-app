#!/usr/bin/env bash
# Build Piano Lessons without Gradle: aapt2 -> javac -> d8 -> zipalign -> apksigner.
# Usage: bash build.sh            (writes out/PianoLessons.apk)
#        bash build.sh install    (also installs on every connected adb device)
set -euo pipefail
cd "$(dirname "$0")"

SDK="/c/Android"
BT="$SDK/build-tools/37.0.0"   # 34.0.0's d8 crashes on JDK 21 class files
JAR="$SDK/platforms/android-34/android.jar"
JDK="/c/Program Files/Microsoft/jdk-21.0.12.101-hotspot/bin"
KEY="keystore/piano.jks"   # keep this file: updates must be signed with the same key
export JAVA_HOME="C:\\Program Files\\Microsoft\\jdk-21.0.12.101-hotspot"   # d8/apksigner .bat files need it
export PATH="$JDK:$PATH"

rm -rf build out && mkdir -p build/gen build/classes build/dex out

"$BT/aapt2.exe" compile --dir res -o build/res.zip
"$BT/aapt2.exe" link -I "$JAR" --manifest AndroidManifest.xml -A assets \
  --min-sdk-version 24 --target-sdk-version 34 \
  --java build/gen -o build/unsigned.apk build/res.zip

"$JDK/javac.exe" -nowarn -Xlint:-options -source 8 -target 8 -cp "$JAR" -d build/classes \
  $(find src build/gen -name '*.java') 2>&1 | grep -v "bootstrap classpath" || true

cmd //c "$(cygpath -w "$BT/d8.bat")" --min-api 24 --lib "$(cygpath -w "$JAR")" \
  --output "$(cygpath -w build/dex)" $(find build/classes -name '*.class' -exec cygpath -w {} \;)

python - <<'EOF'
import zipfile
with zipfile.ZipFile("build/unsigned.apk", "a", zipfile.ZIP_DEFLATED) as z:
    z.write("build/dex/classes.dex", "classes.dex")
EOF

"$BT/zipalign.exe" -f -p 4 build/unsigned.apk build/aligned.apk

if [ ! -f "$KEY" ]; then
  mkdir -p keystore
  "$JDK/keytool.exe" -genkeypair -keystore "$KEY" -alias piano -keyalg RSA -keysize 2048 \
    -validity 36500 -storepass android -keypass android -dname "CN=Piano Lessons (home)" >/dev/null
fi
cmd //c "$(cygpath -w "$BT/apksigner.bat")" sign --ks "$(cygpath -w "$KEY")" --ks-pass pass:android \
  --out "$(cygpath -w out/PianoLessons.apk)" "$(cygpath -w build/aligned.apk)"

echo "built: out/PianoLessons.apk ($(du -h out/PianoLessons.apk | cut -f1))"

if [ "${1:-}" = "release" ]; then
  # Every version is downloadable from GitHub: tag v<version>, attach the signed APK.
  VER="${2:?usage: bash build.sh release <version>}"
  export PATH="/c/Program Files/GitHub CLI:$PATH"
  cp out/PianoLessons.apk "out/PianoLessons-$VER.apk"
  git tag -a "v$VER" -m "Piano Lessons $VER" 2>/dev/null || true
  git push origin "v$VER"
  gh release create "v$VER" "out/PianoLessons-$VER.apk" --title "Piano Lessons $VER" \
    --notes "${NOTES:-Download PianoLessons-$VER.apk and install it on Android 7+.}"
fi

if [ "${1:-}" = "install" ]; then
  for d in $(adb devices | awk 'NR>1 && $2=="device"{print $1}'); do
    echo "== $d"; adb -s "$d" install -r out/PianoLessons.apk
  done
fi
