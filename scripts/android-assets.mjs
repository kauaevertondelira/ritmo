import sharp from 'sharp';
import { access, mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
export async function androidAssets(root) {
  const res=join(root,'android/app/src/main/res');
  try { await access(res); } catch { return; }
  const icon=join(root,'icons/icon-512.png');
  for(const [density,size] of [['mdpi',48],['hdpi',72],['xhdpi',96],['xxhdpi',144],['xxxhdpi',192]]) {
    for(const name of ['ic_launcher','ic_launcher_round','ic_launcher_foreground']) await sharp(icon).resize(size,size).toFile(join(res,`mipmap-${density}/${name}.png`));
  }
  await mkdir(join(res,'drawable-nodpi'),{recursive:true});
  await sharp(icon).resize(432,432).toFile(join(res,'drawable-nodpi/ritmo_launcher.png'));
  const xml='<?xml version="1.0" encoding="utf-8"?>\n<adaptive-icon xmlns:android="http://schemas.android.com/apk/res/android"><background android:drawable="@color/ic_launcher_background"/><foreground android:drawable="@drawable/ritmo_launcher"/></adaptive-icon>\n';
  for(const name of ['ic_launcher','ic_launcher_round']) await writeFile(join(res,`mipmap-anydpi-v26/${name}.xml`),xml);
  await writeFile(join(res,'values/ic_launcher_background.xml'),'<?xml version="1.0" encoding="utf-8"?>\n<resources><color name="ic_launcher_background">#191c1b</color></resources>\n');
}
