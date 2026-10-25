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

# Voice quiz (Vosk): jars + arm64 native libs live in third_party/vosk (committed, small);
# the speech models (~80 MB) are NOT committed: copied from the local staging folder, else downloaded once.
VOSK="third_party/vosk"
VJARS="$VOSK/vosk-android-0.3.75-classes.jar $VOSK/jna-5.18.1-classes.jar"
MODELS_SRC="${MODELS_SRC:-/e/Home-Apps/_staging/vosk/models}"
for pair in en:vosk-model-small-en-us-0.15 es:vosk-model-small-es-0.42; do
  L="${pair%%:*}"; N="${pair#*:}"; D="assets/models/$L"
  [ -d "$D" ] && continue
  mkdir -p assets/models
  if [ -d "$MODELS_SRC/$N" ]; then
    cp -r "$MODELS_SRC/$N" "$D"
  else
    echo "downloading speech model $N (~40 MB)"
    TMP="$(mktemp -d)"
    curl -fL -o "$TMP/m.zip" "https://alphacephei.com/vosk/models/$N.zip"
    python -I -c "import zipfile,sys; zipfile.ZipFile(sys.argv[1]).extractall(sys.argv[2])" "$(cygpath -w "$TMP/m.zip")" "$(cygpath -w "$TMP")"
    mv "$TMP/$N" "$D"; rm -rf "$TMP"
  fi
  [ -f "$D/uuid" ] || echo "$N" > "$D/uuid"   # StorageService.unpack needs it to know when to re-copy
done

"$BT/aapt2.exe" compile --dir res -o build/res.zip
"$BT/aapt2.exe" link -I "$JAR" --manifest AndroidManifest.xml -A assets \
  --min-sdk-version 24 --target-sdk-version 34 \
  --java build/gen -o build/unsigned.apk build/res.zip

CP="$(cygpath -w "$JAR")"
for j in $VJARS; do CP="$CP;$(cygpath -w "$j")"; done
"$JDK/javac.exe" -nowarn -encoding UTF-8 -Xlint:-options -source 8 -target 8 -cp "$CP" -d build/classes \
  $(find src build/gen -name '*.java') 2>&1 | grep -v "bootstrap classpath" || true

cmd //c "$(cygpath -w "$BT/d8.bat")" --min-api 24 --lib "$(cygpath -w "$JAR")" \
  --output "$(cygpath -w build/dex)" $(find build/classes -name '*.class' -exec cygpath -w {} \;) \
  $(for j in $VJARS; do cygpath -w "$j"; done)

python - <<'EOF'
import zipfile
with zipfile.ZipFile("build/unsigned.apk", "a", zipfile.ZIP_DEFLATED) as z:
    z.write("build/dex/classes.dex", "classes.dex")
    for so in ("libvosk.so", "libjnidispatch.so"):        # Vosk + JNA native libraries (arm64 tablets only)
        z.write("third_party/vosk/lib/arm64-v8a/" + so, "lib/arm64-v8a/" + so)
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
  # Release notes = this version's section of CHANGELOG.md (every release says what it added)
  SECTION="$(awk -v v="## $VER " 'index($0, v) == 1 {on = 1; next} on && /^## / {exit} on' CHANGELOG.md)"
  [ -n "$SECTION" ] || { echo "CHANGELOG.md has no '## $VER ' section - add one first" >&2; exit 1; }
  gh release create "v$VER" "out/PianoLessons-$VER.apk" --title "Piano Lessons $VER" \
    --notes "${NOTES:-$SECTION

Download PianoLessons-$VER.apk and install it on Android 7+. Full history: CHANGELOG.md}"
  # Keep the Obsidian WORK_BRAIN copy of the changelog in sync
  VAULT="/e/BRAINS-MEMMORIES/WORK_BRAIN/PC & Hardware/Phones"
  [ -d "$VAULT" ] && cp CHANGELOG.md "$VAULT/Piano Lessons changelog.md" && echo "changelog synced to Obsidian"
fi

if [ "${1:-}" = "install" ]; then
  for d in $(adb devices | awk 'NR>1 && $2=="device"{print $1}'); do
    echo "== $d"; adb -s "$d" install -r out/PianoLessons.apk
  done
fi
