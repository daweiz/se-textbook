/* 客户端埋点脚本：由 server.mjs 内联注入到各 HTML 页面的 </body> 前。
 * 页面加载时上报 start 信标，离开（pagehide / 切后台）时上报 end 信标（带停留秒数）。
 * page 标识由注入点通过 window.TRACK_PAGE 提供（教材=book / 幻灯片首页=slides-index / 幻灯片播放=slides-player）。
 * 注意：文件内容不得出现 script 标签结束符字样，否则会提前闭合注入的脚本块、破坏埋点。
 * 零依赖，使用 Image 信标，不阻塞页面、无跨域问题。
 */
(function () {
  var vid = Math.random().toString(36).slice(2) + Date.now().toString(36)
  var page =
    typeof window.TRACK_PAGE !== 'undefined' && window.TRACK_PAGE
      ? window.TRACK_PAGE
      : location.pathname
  var start = Date.now()
  var sent = false
  function ping(type) {
    if (sent) return
    sent = true
    var dur = type === 'end' ? Math.max(0, Math.round((Date.now() - start) / 1000)) : 0
    new Image().src =
      'track.gif?type=' + type + '&vid=' + encodeURIComponent(vid) + '&dur=' + dur +
      '&page=' + encodeURIComponent(page) + '&_=' + Date.now()
  }
  window.addEventListener('pagehide', function () { ping('end') })
  document.addEventListener('visibilitychange', function () {
    if (document.visibilityState === 'hidden') ping('end')
  })
  ping('start')
})()
