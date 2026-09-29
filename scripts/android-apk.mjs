import { spawn } from 'node:child_process';
import { mkdir, copyFile } from 'node:fs/promises';
const windows=process.platform==='win32';
const child=spawn(windows?'cmd.exe':'./gradlew',windows?['/d','/s','/c','gradlew.bat assembleDebug --no-daemon']:['assembleDebug','--no-daemon'],{cwd:'android',stdio:'inherit'});
child.on('error',error=>{console.error('Não foi possível iniciar o Gradle:',error.message);process.exitCode=1;});
child.on('exit',async code=>{if(code!==0){process.exitCode=code||1;return;}await mkdir('releases',{recursive:true});await copyFile('android/app/build/outputs/apk/debug/app-debug.apk','releases/ritmo-android.apk');console.log('APK para uso pessoal: releases/ritmo-android.apk');});
