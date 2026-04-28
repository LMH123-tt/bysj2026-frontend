/**
 * 日期格式化
 * @param {string|number|Date} time 时间
 * @param {string} pattern 格式，默认 '{y}-{m}-{d}'
 * @returns {string}
 */
export function parseTime(time, pattern) {
  if (arguments.length === 0 || !time) {
    return null
  }
  const format = pattern || '{y}-{m}-{d}'
  let date
  if (typeof time === 'object') {
    date = time
  } else {
    if (typeof time === 'string' && /^\d+$/.test(time)) {
      time = parseInt(time)
    } else if (typeof time === 'string') {
      time = time.replace(new RegExp(/-/gm), '/').replace('T', ' ').replace(new RegExp(/\.\d{3}/gm), '')
    }
    if (typeof time === 'number' && time.toString().length === 10) {
      time = time * 1000
    }
    date = new Date(time)
  }
  const formatObj = {
    y: date.getFullYear(),
    m: date.getMonth() + 1,
    d: date.getDate(),
    h: date.getHours(),
    i: date.getMinutes(),
    s: date.getSeconds(),
    a: date.getDay()
  }
  const time_str = format.replace(/{(y|m|d|h|i|s|a)+}/g, (result, key) => {
    let value = formatObj[key]
    if (key === 'a') {
      return ['日', '一', '二', '三', '四', '五', '六'][value]
    }
    if (result.length > 0 && value < 10) {
      value = '0' + value
    }
    return value || 0
  })
  return time_str
}

/**
 * 格式化日期为相对时间或标准格式
 * @param {string|Date} cellValue 日期
 * @returns {string}
 */
export function formatDate(cellValue) {
  if (cellValue == null || cellValue === '') return ''
  const now = new Date()
  const date = new Date(cellValue)
  const diff = now - date
  const minute = 60 * 1000
  const hour = 60 * minute
  const day = 24 * hour

  if (diff < minute) {
    return '刚刚'
  } else if (diff < hour) {
    return Math.floor(diff / minute) + '分钟前'
  } else if (diff < day) {
    return Math.floor(diff / hour) + '小时前'
  } else if (diff < day * 7) {
    return Math.floor(diff / day) + '天前'
  } else {
    return parseTime(cellValue, '{y}-{m}-{d}')
  }
}

/**
 * 获取当前时间戳（毫秒）
 */
export function getCurrentTimestamp() {
  return new Date().getTime()
}

/**
 * 格式化数字，保留n位小数
 */
export function formatNumber(num, digits = 2) {
  return parseFloat(num).toFixed(digits)
}

/**
 * 格式化文件大小
 */
export function formatFileSize(size) {
  if (!size) return '0 B'
  const units = ['B', 'KB', 'MB', 'GB', 'TB']
  const index = Math.floor(Math.log(size) / Math.log(1024))
  return (size / Math.pow(1024, index)).toFixed(2) + ' ' + units[index]
}

/**
 * 深拷贝
 */
export function deepClone(obj) {
  return JSON.parse(JSON.stringify(obj))
}

/**
 * 防抖函数
 * @param {Function} fn 函数
 * @param {number} delay 延迟时间
 * @returns {Function}
 */
export function debounce(fn, delay = 300) {
  let timer = null
  return function (...args) {
    if (timer) clearTimeout(timer)
    timer = setTimeout(() => {
      fn.apply(this, args)
    }, delay)
  }
}

/**
 * 节流函数
 * @param {Function} fn 函数
 * @param {number} interval 间隔时间
 * @returns {Function}
 */
export function throttle(fn, interval = 300) {
  let last = 0
  return function (...args) {
    const now = Date.now()
    if (now - last >= interval) {
      last = now
      fn.apply(this, args)
    }
  }
}
