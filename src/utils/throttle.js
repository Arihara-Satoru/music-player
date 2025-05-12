// src/utils/throttle.js

/**
 * 原生节流函数
 * @param {Function} fn - 需要节流执行的函数
 * @param {number} delay - 节流间隔时间（毫秒）
 * @returns {Function} 返回节流包装后的函数
 */
export function throttle(fn, delay) {
  let lastCall = 0
  return function (...args) {
    const now = Date.now()
    if (now - lastCall >= delay) {
      lastCall = now
      fn(...args)
    }
  }
}
