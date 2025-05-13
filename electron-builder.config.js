module.exports = {
  appId: "com.example.kugoumusic",
  productName: "KuGou Music",
  directories: {
    output: "release"
  },
  asar: true,
  compression: "maximum",
  files: [
    "dist/**/*",
    "electron/**/*"
  ],
  extraResources: [
    {
      from: "KuGouMusicApi/public",
      to: "KuGouMusicApi/public",
      filter: ["**/*"]
    },
    {
      from: "KuGouMusicApi/module",
      to: "KuGouMusicApi/module",
      filter: ["**/*"]
    }
  ],
  win: {
    target: "nsis",
    icon: "build/icon.ico"
  },
  nsis: {
    oneClick: false,
    perMachine: true,
    allowToChangeInstallationDirectory: true,
    compression: "zlib"
  }
}
