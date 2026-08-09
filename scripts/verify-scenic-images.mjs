import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const failures = [];

function fail(message) {
  failures.push(message);
}

function read(relativePath) {
  return fs.readFileSync(path.join(root, relativePath), "utf8");
}

function walk(directory) {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const fullPath = path.join(directory, entry.name);
    return entry.isDirectory() ? walk(fullPath) : [fullPath];
  });
}

function projectImagePath(publicPath) {
  return path.join(root, "public", ...publicPath.split("/").filter(Boolean));
}

const codeFiles = [
  ...walk(path.join(root, "src")).filter((file) => /\.(?:ts|tsx)$/.test(file)),
  path.join(root, "seed.ts"),
];

const missingReferences = new Set();
for (const file of codeFiles) {
  const source = fs.readFileSync(file, "utf8");
  const relativeFile = path.relative(root, file);

  for (const match of source.matchAll(/\/images\/spots\/[^"'`)\s]+/g)) {
    const publicPath = match[0];
    if (!fs.existsSync(projectImagePath(publicPath))) {
      missingReferences.add(`${relativeFile}: ${publicPath}`);
    }
  }

  if (/\/images\/spots\/[^"']+\.(?:jpg|png)/i.test(source)) {
    fail(`${relativeFile} 仍引用 JPG/PNG 景点资源`);
  }
}

for (const reference of missingReferences) {
  fail(`本地资源不存在：${reference}`);
}

const spotDirectory = path.join(root, "public", "images", "spots");
const webpFiles = fs.readdirSync(spotDirectory).filter((file) => file.endsWith(".webp"));
const sourcedWebpFiles = webpFiles.filter((file) =>
  /^(?:\d+|route-\d+|yueyang-tower|houmuwu-ding)\.webp$/.test(file),
);
if (sourcedWebpFiles.length !== 121) {
  fail(`预期 121 个已记录 WebP 独有资源，实际 ${sourcedWebpFiles.length} 个`);
}

for (const file of webpFiles) {
  const buffer = fs.readFileSync(path.join(spotDirectory, file));
  if (
    buffer.length < 12 ||
    buffer.toString("ascii", 0, 4) !== "RIFF" ||
    buffer.toString("ascii", 8, 12) !== "WEBP"
  ) {
    fail(`${file} 不是可识别的 WebP 文件`);
  }
}

const nationalSource = read("src/lib/data/national-spots.ts");
const nationalImages = [...nationalSource.matchAll(/imageUrl:\s*"(\/images\/spots\/[^"']+\.webp)"/g)];
if (nationalImages.length !== 76) {
  fail(`全国景点应有 76 个本地图片映射，实际 ${nationalImages.length} 个`);
}
if (/https?:\/\//.test(nationalSource)) {
  fail("全国景点数据仍包含远程 URL");
}

const routesSource = read("src/components/screens/RoutesScreen.tsx");
const routeData = routesSource.slice(
  routesSource.indexOf("const CHONGQING_SPOTS"),
  routesSource.indexOf("const POPULAR_CITIES"),
);
const routeImages = [...routeData.matchAll(/img:\s*"(\/images\/spots\/[^"']+\.webp)"/g)];
if (routeImages.length !== 83) {
  fail(`路线页应有 83 个本地图片映射，实际 ${routeImages.length} 个`);
}

for (const file of [
  "src/components/screens/HomeScreen.tsx",
  "src/components/screens/SpotsScreen.tsx",
  "src/components/screens/SearchScreen.tsx",
  "src/components/screens/SpotDetailScreen.tsx",
]) {
  if (/images\.unsplash\.com/.test(read(file))) {
    fail(`${file} 仍包含 Unsplash 景点图片`);
  }
}

const profileSource = read("src/components/screens/ProfileScreen.tsx");
for (const name of ["岳阳楼", "黄鹤楼", "商后母戊鼎"]) {
  const remoteNamedImage = new RegExp(`name:\\s*"${name}"[^\\n]*https?://`);
  if (remoteNamedImage.test(profileSource)) {
    fail(`个人页的${name}仍使用远程图片`);
  }
}

const seedSource = read("seed.ts");
const seedPlaceholders = seedSource.match(/imageUrl:\s*"\/images\/spots\/placeholder\.svg"/g) || [];
if (seedPlaceholders.length !== 10) {
  fail(`虚构种子数据应有 10 个占位图映射，实际 ${seedPlaceholders.length} 个`);
}

const sourceDocument = read("docs/spot-image-sources.md");
const nationalRows = sourceDocument.match(/^\| national \|/gm) || [];
const routeRows = sourceDocument.match(/^\| route \|/gm) || [];
const profileRows = sourceDocument.match(/^\| profile \|/gm) || [];
if (nationalRows.length !== 76 || routeRows.length !== 83 || profileRows.length !== 2) {
  fail(
    `来源文档行数不符：national=${nationalRows.length}, route=${routeRows.length}, profile=${profileRows.length}`,
  );
}
if (
  /See linked source page|See source page/i.test(sourceDocument) ||
  /\[\/images\/spots\/[^\]]+\.(?:jpg|png)\]/i.test(sourceDocument)
) {
  fail("来源文档仍含占位许可证或旧格式图片路径");
}

if (failures.length > 0) {
  console.error("景点图片验证失败：");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("景点图片验证通过：76 个全国景点、83 个路线景点、121 个已记录 WebP 资源。");
