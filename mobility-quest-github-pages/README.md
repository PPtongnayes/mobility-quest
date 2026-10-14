# Mobility Quest · GitHub Pages 托管包

本包来自你指定的 Windows Content Studio v1.1 文件夹，使用该文件夹的正式 content.json。没有把未发布草稿、历史备份、个人成绩或 Windows 运行环境放进网站。

## 发布到 GitHub Pages

1. 创建或打开准备使用的 GitHub 仓库。
2. 把这个文件夹里面的全部网页文件上传到仓库根目录。index.html、content.json 和 .nojekyll 应直接位于根目录，不要只上传 ZIP，也不要把它们套在第二层文件夹中。
3. 打开仓库 Settings → Pages。
4. Source 选 Deploy from a branch，Branch 选 main，Folder 选 /(root)，然后 Save。
5. 等待 GitHub 完成部署，使用 Pages 页面显示的网址访问。项目仓库通常位于 https://你的用户名.github.io/仓库名/，不需要购买自定义域名。

也可将全部文件放进仓库 docs 文件夹，选择 main /docs。所有资源使用相对路径，支持仓库子路径。

官方说明：https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site

## 学习功能

中文 / English 切换、知识学习、三关挑战、星级评分和定制奖杯均可使用。个人进度只保存在当前浏览器，不会上传或跨设备同步。

## 网页内容管理的重要区别

GitHub Pages 只托管静态文件，网页不能直接替换 GitHub 仓库文件。这里的“内容管理（本机）”只保存当前浏览器的草稿、预览版本和最多 12 个历史备份。

1. 在内容管理中修改、检查和预览。
2. 到“版本与分发”，点击“导出网站 content.json”。
3. 将下载的 content.json 上传到 GitHub 仓库，替换原同名文件并提交。
4. 等待 Pages 更新后刷新正式课程。其他访客才会获得新内容。

“应用到本机预览”不会修改正式网站；没有上传文件前，其他访客仍看到原课程。预览成绩与正式成绩分开。无需填写 GitHub 密钥或密码。

清理浏览器网站数据会丢失本机草稿和备份，重要修改请及时导出。使用私密窗口时，本机存储可能无法长期保留。

也可以继续使用 Windows APP 维护内容，再导出内容包，将该内容包作为网站的 content.json 上传。

## 内容管理入口

首页可进入内容管理；也可直接访问 admin.html。没有管理员账号或远程发布功能，每位访问者只能操作自己的本机草稿，不能借此修改服务器课程。

## 本地体验

不要直接双击 index.html。若电脑有 Python，可在此文件夹打开终端运行 python -m http.server 8080，再访问 http://localhost:8080/。正式托管不需要安装依赖、执行构建或启动服务器。

本包没有启用离线 Service Worker，以减少内容更新时旧课程缓存带来的混淆。正式网页需要网络连接。
