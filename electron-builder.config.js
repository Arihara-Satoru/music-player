module.exports = {
  appId: "com.example.kugoumusic",
  productName: "KuGou Music",
  directories: {
    output: "release"
  },
  files: [
    "dist/**/*",
    "electron/**/*",
    "KuGouMusicApi/**/*"
  ],
  extraResources: [
    {
      from: "KuGouMusicApi",
      to: "KuGouMusicApi"
    }
  ],
  win: {
    target: "nsis",
    icon: "build/icon.ico"
  },
  nsis: {
    oneClick: false,
    perMachine: true,
    allowToChangeInstallationDirectory: true
  }
}
