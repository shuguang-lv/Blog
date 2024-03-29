---
layout: Post
title: JavaScript Snippets
author: Desmond
date: 2021-08-22 22:26:00
useHeaderImage: true
headerImage: https://6772-grp2020-4glv8fo5cd87cf9a-1302562267.tcb.qcloud.la/head-images/js.jpg?sign=2d8dc805e194eada86067c9398dfd155&t=1653755633
headerMask: rgba(45, 55, 71, .5)
permalinkPattern: /post/:year/:month/:day/:slug/
tags: [JavaScript]
---

# JavaScript Snippets

---

## 数组乱序

```javascript
function randomSort(arr) {
  let result = []

  while (arr.length > 0) {
    let randomIndex = Math.floor(Math.random() * arr.length)
    result.push(arr[randomIndex])
    arr.splice(randomIndex, 1)
  }

  return result
}

function randomSort(arr) {
  let index,
    randomIndex,
    len = arr.length

  for (index = 0; index < len; index++) {
    randomIndex = Math.floor(Math.random() * (len - index)) + index
    ;[arr[index], arr[randomIndex]] = [arr[randomIndex], arr[index]]
  }

  return arr
}

randomSort([1, 3, 4, 6, 7, 8, 2, 3, 0])[(1, 2, 3)].sort(
  () => Math.random() - 0.5
)
```

## 寄生式组合继承

```javascript
//寄生组合式继承的核心方法
function inherit(child, parent) {
  // 继承父类的原型
  const parentPrototype = Object.create(parent.prototype)
  // 将父类原型和子类原型合并，并赋值给子类的原型
  child.prototype = Object.assign(parentPrototype, child.prototype)
  // 重写被污染的子类的constructor
  p.constructor = child
}

//User, 父类
function User(username, password) {
  let _password = password
  this.username = username
}

User.prototype.login = function () {
  console.log(this.username + '要登录Github，密码是' + _password)
  //>> ReferenceError: _password is not defined
}

//CoffeUser, 子类
function CoffeUser(username, password) {
  User.call(this, username, password) // 继承属性
  this.articles = 3 // 文章数量
}

//继承
inherit(CoffeUser, User)

//在原型上添加新方法
CoffeUser.prototype.readArticle = function () {
  console.log('Read article')
}

const user1 = new CoffeUser('Coffe1891', '123456')
console.log(user1)
```

## 防抖与节流

- **debounce**: Creates a debounced function that delays invoking the provided function until at least `ms` milliseconds have elapsed since its last invocation.

- **throttle**: Creates a throttled function that only invokes the provided function at most once per every `wait` milliseconds

```javascript
const debounce = (fn, ms = 0) => {
  let timeoutId
  return function (...args) {
    clearTimeout(timeoutId)
    timeoutId = setTimeout(() => fn.apply(this, args), ms)
  }
}

const throttle = (fn, wait) => {
  let inThrottle, lastFn, lastTime
  return function () {
    const context = this,
      args = arguments
    if (!inThrottle) {
      fn.apply(context, args)
      lastTime = Date.now()
      inThrottle = true
    } else {
      clearTimeout(lastFn)
      lastFn = setTimeout(function () {
        if (Date.now() - lastTime >= wait) {
          fn.apply(context, args)
          lastTime = Date.now()
        }
      }, Math.max(wait - (Date.now() - lastTime), 0))
    }
  }
}
```

## 对象拷贝

```javascript
// 会忽略 undefined
// 会忽略 symbol
// 不能序列化函数正则对象等特殊对象
// 不能处理指向相同引用的情况，相同的引用会被重复拷贝
JSON.parse(JSON.stringify())

// 浅拷贝
Object.assign({}, obj)

function shallowCopy(object) {
  if (!object || typeof object !== 'object') return object

  let newObject = Array.isArray(object) ? [] : {}

  for (const key in object) {
    if (Object.hasOwnProperty.call(object, key)) {
      newObject[key] = object[key]
    }
  }

  return newObject
}

function deepCopy(obj) {
  // Hash表 记录所有的对象引用关系
  let map = new WeakMap()

  function dp(obj) {
    let result = null
    let keys = null,
      key = null,
      temp = null,
      existObj = null

    existObj = map.get(obj)
    // 如果这个对象已被记录则直接返回
    if (existObj) {
      return existObj
    }
    result = {}
    // 记录当前对象
    map.set(obj, result)
    keys = Object.keys(obj)
    for (let i = 0; i < keys.length; i++) {
      key = keys[i]
      temp = obj[key]
      // 如果字段的值也是一个对象则递归复制
      if (temp && typeof temp === 'object') {
        result[key] = dp(temp)
      } else {
        // 否则直接赋值给新对象
        result[key] = temp
      }
    }
    return result
  }
  return dp(obj)
}
```

## call, apply, bind 实现

```javascript
/**
 * 用原生JavaScript实现call
 */
Function.prototype.myCall = function (thisArg, ...arr) {
  //1.判断参数合法性/////////////////////////
  if (thisArg === null || thisArg === undefined) {
    //指定为 null 和 undefined 的 this 值会自动指向全局对象(浏览器中为window)
    thisArg = window
  } else {
    thisArg = Object(thisArg) //创建一个可包含数字/字符串/布尔值的对象，
    //thisArg 会指向一个包含该原始值的对象。
  }

  //2.搞定this的指向/////////////////////////
  const specialMethod = Symbol('anything') //创建一个不重复的常量
  //如果调用myCall的函数名是func，也即以func.myCall()形式调用；
  //根据上篇文章介绍，则myCall函数体内的this指向func
  thisArg[specialMethod] = this //给thisArg对象建一个临时属性来储存this（也即func函数）
  //进一步地，根据上篇文章介绍，func作为thisArg对象的一个方法被调用，那么func中的this便
  //指向thisArg对象。由此，巧妙地完成将this隐式地指向到thisArg！
  let result = thisArg[specialMethod](...arr)

  //3.收尾
  delete thisArg[specialMethod] //删除临时方法
  return result //返回临时方法的执行结果
}

/**
 * 用原生JavaScript实现apply
 */
Function.prototype.myApply = function (thisArg) {
  if (thisArg === null || thisArg === undefined) {
    thisArg = window
  } else {
    thisArg = Object(thisArg)
  }

  //判断是否为【类数组对象】
  function isArrayLike(o) {
    if (
      o && // o不是null、undefined等
      typeof o === 'object' && // o是对象
      isFinite(o.length) && // o.length是有限数值
      o.length >= 0 && // o.length为非负值
      o.length === Math.floor(o.length) && // o.length是整数
      o.length < 4294967296
    )
      // o.length < 2^32
      return true
    else return false
  }

  const specialMethod = Symbol('anything')
  thisArg[specialMethod] = this

  let args = arguments[1] // 获取参数数组
  let result

  // 处理传进来的第二个参数
  if (args) {
    // 是否传递第二个参数
    if (!Array.isArray(args) && !isArrayLike(args)) {
      throw new TypeError('第二个参数既不为数组，也不为类数组对象。抛出错误')
    } else {
      args = Array.from(args) // 转为数组
      result = thisArg[specialMethod](...args) // 执行函数并展开数组，传递函数参数
    }
  } else {
    result = thisArg[specialMethod]()
  }

  delete thisArg[specialMethod]
  return result // 返回函数执行结果
}

/**
 * 用原生JavaScript实现bind
 */
Function.prototype.myBind = function (objThis, ...params) {
  const thisFn = this //存储调用函数，以及上方的params(函数参数)
  //对返回的函数 secondParams 二次传参
  let funcForBind = function (...secondParams) {
    //检查this是否是funcForBind的实例？也就是检查funcForBind是否通过new调用
    const isNew = this instanceof funcForBind

    //new调用就绑定到this上,否则就绑定到传入的objThis上
    const thisArg = isNew ? this : Object(objThis)

    //用call执行调用函数，绑定this的指向，并传递参数。返回执行结果
    return thisFn.call(thisArg, ...params, ...secondParams)
  }

  //复制调用函数的prototype给funcForBind
  funcForBind.prototype = Object.create(thisFn.prototype)
  return funcForBind //返回拷贝的函数
}
```

## 柯里化

```javascript
function curry(fn, args) {
  let length = fn.length

  args = args || []

  return function () {
    let subArgs = args.slice(0)

    for (let i = 0; i < arguments.length; i++) {
      subArgs.push(arguments[i])
    }

    if (subArgs.length >= length) {
      return fn.apply(this, subArgs)
    } else {
      return curry.call(this, fn, subArgs)
    }
  }
}

function curry(fn, ...args) {
  return fn.length <= args.length ? fn(...args) : curry.bind(null, fn, ...args)
}
```

## 变量类型判断

```javascript
function getType(value) {
  if (value === null) {
    return value + ''
  }

  if (typeof value === 'object') {
    let valueClass = Object.prototype.toString.call(value),
      type = valueClass.split(' ')[1].split('')

    type.pop()

    return type.join('').toLowerCase()
  } else {
    return typeof value
  }
}
```

## 判断空对象

```javascript
function checkNullObj(obj) {
  return (
    Object.keys(obj).length === 0 &&
    Object.getOwnPropertySymbols(obj).length === 0
  )
}
```

## 局部作用域捕获循环中的变量

```javascript
for (var i = 0; i < 5; i++) {
  ;(function (i) {
    setTimeout(function () {
      console.log(i)
    }, i * 1000)
  })(i)
}

for (let i = 0; i < 5; i++) {
  setTimeout(function () {
    console.log(i)
  }, i * 1000)
}
```

## 数组最值

```javascript
Math.max.apply(null, [1, 2, 3])

var arr = [6, 4, 1, 8, 2, 11, 23]

function max(prev, next) {
  return Math.max(prev, next)
}
console.log(arr.reduce(max))

arr.sort(function (a, b) {
  return a - b
})
console.log(arr[arr.length - 1])

console.log(Math.max(...arr))

/**
 * 高性能数组拼接
 */

let array1 = [1, 2, 3]
let array2 = [4, 5, 6]
array1.push.apply(array1, array2)
```

## 数组排序

```javascript
// numeric array
const arr = [8, 2, 1, 4, 5, 0]
// Sort in ascending order
arr.sort((a, b) => a - b) // [0, 1, 2, 4, 5, 8]
// Sort in descending order
arr.sort((a, b) => b - a) // [8, 5, 4, 2, 1, 0]

// string array
const s = ['Hi', 'Hola', 'Hello']
// Sort in ascending order
arr.sort((a, b) => a.localeCompare(b)) // ['Hello', 'Hi', 'Hola']
// Sort in descending order
arr.sort((a, b) => b.localeCompare(a)) // ['Hola', 'Hi', 'Hello']
```

## 斐波那契

```javascript
// 动态规划
function fibonacci(n) {
  let n1 = 1,
    n2 = 1,
    sum = 1

  for (let i = 3; i <= n; i++) {
    sum = n1 + n2
    n1 = n2
    n2 = sum
  }

  return sum
}

// 递归
function fib(n, memo = {}) {
  if (n == 0 || n == 1) return n

  if (memo[n]) {
    return memo[n]
  }
  memo[n] = fib(n - 2, memo) + fib(n - 1, memo)
  return memo[n]
}

// 尾递归
function fib(n, ac1 = 0, ac2 = 1) {
  if (n == 0) return 0
  if (n == 1) {
    if (ac2 == 1) return 1
    return ac2
  }
  return fib(n - 1, ac2, ac1 + ac2)
}
```

## 数组去重

```javascript
function dedupe(array) {
  return Array.from(new Set(array))
}

let arr = [1, 2, 3, 4]
let unique = [...new Set(arr)]

function unique(array) {
  return array
    .concat()
    .sort()
    .filter(function (item, index, array) {
      return !index || item !== array[index - 1]
    })
}
```

## 大数相加

```javascript
function bigNumberSum(a, b) {
  // 123456789
  // 000009876

  // padding
  let cur = 0
  while (cur < a.length || cur < b.length) {
    if (!a[cur]) {
      a = '0' + a
    } else if (!b[cur]) {
      b = '0' + b
    }
    cur++
  }

  let carried = 0
  const res = []

  for (let i = a.length - 1; i > -1; i--) {
    const sum = carried + +a[i] + +b[i]
    if (sum > 9) {
      carried = 1
    } else {
      carried = 0
    }
    res[i] = sum % 10
  }
  if (carried === 1) {
    res.unshift(1)
  }

  return res.join('')
}
```

## 数组扁平化

```javascript
function flatten(arr) {
  return arr.reduce(function (prev, next) {
    return prev.concat(Array.isArray(next) ? flatten(next) : next)
  }, [])
}

function flattenDepth(list, n) {
  if (list.length === 0) return []
  if (n === 0) return list
  const head = list[0]
  if (head instanceof Array) {
    list[0] = flattenDepth(head, n - 1)
  } else {
    list[0] = [list[0]]
  }
  return list[0].concat(flattenDepth(list.slice(1), n))
}

/**
 * 数组扁平化
 * @param  {Array} input   要处理的数组
 * @param  {boolean} shallow 是否只扁平一层
 * @param  {boolean} strict  是否严格处理元素，下面有解释
 * @param  {Array} output  这是为了方便递归而传递的参数
 * 源码地址：https://github.com/jashkenas/underscore/blob/master/underscore.js#L528
 */
function flatten(input, shallow, strict, output) {
  // 递归使用的时候会用到output
  output = output || []
  var idx = output.length

  for (var i = 0, len = input.length; i < len; i++) {
    var value = input[i]
    // 如果是数组，就进行处理
    if (Array.isArray(value)) {
      // 如果是只扁平一层，遍历该数组，依此填入 output
      if (shallow) {
        var j = 0,
          len = value.length
        while (j < len) output[idx++] = value[j++]
      }
      // 如果是全部扁平就递归，传入已经处理的 output，递归中接着处理 output
      else {
        flatten(value, shallow, strict, output)
        idx = output.length
      }
    }
    // 不是数组，根据 strict 的值判断是跳过不处理还是放入 output
    else if (!strict) {
      output[idx++] = value
    }
  }

  return output
}

// 迭代实现
const flatten = function (arr) {
  const result = []
  // 将数组元素拷贝至栈，直接赋值会改变原数组
  const stack = [...arr]
  // 如果栈不为空，则循环遍历
  while (stack.length !== 0) {
    const val = stack.pop()
    if (Array.isArray(val)) {
      // 如果是数组再次入栈，并且展开了一层
      stack.push(...val)
    } else {
      // 如果不是数组，就用头插法插入到结果数组中
      result.unshift(val)
    }
  }
  return result
}
```

## 周期有限次执行函数

```javascript
function repeat(func, times, ms, immediate) {
  let count = 0
  const ctx = null

  function inner(...args) {
    count++
    if (count === 1 && immediate) {
      func.call(ctx, ...args)
      inner.call(ctx, ...args)
      return
    }
    if (count > times) {
      return
    }
    return setTimeout(() => {
      func.call(ctx, ...args)
      inner.call(ctx, ...args)
    }, ms)
  }
  return inner
}

const repeatFunc = repeat(console.log, 4, 3000, true)
repeatFunc('hellworld') //先立即打印一个hellworld，然后每三秒打印三个hellworld
```

## 浮点数比较 & 自定义迭代器

```javascript
console.log(Math.abs(0.1 + 0.2 - 0.3) <= Number.EPSILON)

let o = {
  [Symbol.iterator]: () => ({
    _value: 0,
    next() {
      if (this._value == 10)
        return {
          done: true,
        }
      else
        return {
          value: this._value++,
          done: false,
        }
    },
  }),
}
for (let e of o) console.log(e)
```

## vue 双向绑定实现

```javascript
function observe(obj, vm) {
  Object.keys(obj).forEach(function (key) {
    defineReactive(vm, key, obj[key])
  })
}

function defineReactive(obj, key, val) {
  var dep = new Dep()

  Object.defineProperty(obj, key, {
    get: function () {
      // 添加订阅者 watcher 到主题对象 Dep
      if (Dep.target) dep.addSub(Dep.target)
      return val
    },
    set: function (newVal) {
      if (newVal === val) return
      val = newVal
      // 作为发布者发出通知
      dep.notify()
    },
  })
}

function nodeToFragment(node, vm) {
  var flag = document.createDocumentFragment()
  var child
  // 许多同学反应看不懂这一段，这里有必要解释一下
  // 首先，所有表达式必然会返回一个值，赋值表达式亦不例外
  // 理解了上面这一点，就能理解 while (child = node.firstChild) 这种用法
  // 其次，appendChild 方法有个隐蔽的地方，就是调用以后 child 会从原来 DOM 中移除
  // 所以，第二次循环时，node.firstChild 已经不再是之前的第一个子元素了
  while ((child = node.firstChild)) {
    compile(child, vm)
    flag.appendChild(child) // 将子节点劫持到文档片段中
  }

  return flag
}

function compile(node, vm) {
  var reg = /\{\{(.*)\}\}/
  // 节点类型为元素
  if (node.nodeType === 1) {
    var attr = node.attributes
    // 解析属性
    for (var i = 0; i < attr.length; i++) {
      if (attr[i].nodeName == 'v-model') {
        var name = attr[i].nodeValue // 获取 v-model 绑定的属性名
        node.addEventListener('input', function (e) {
          // 给相应的 data 属性赋值，进而触发该属性的 set 方法
          vm[name] = e.target.value
        })
        node.value = vm[name] // 将 data 的值赋给该 node
        node.removeAttribute('v-model')
      }
    }

    new Watcher(vm, node, name, 'input')
  }
  // 节点类型为 text
  if (node.nodeType === 3) {
    if (reg.test(node.nodeValue)) {
      var name = RegExp.$1 // 获取匹配到的字符串
      name = name.trim()

      new Watcher(vm, node, name, 'text')
    }
  }
}

function Watcher(vm, node, name, nodeType) {
  Dep.target = this
  this.name = name
  this.node = node
  this.vm = vm
  this.nodeType = nodeType
  this.update()
  Dep.target = null
}

Watcher.prototype = {
  update: function () {
    this.get()
    if (this.nodeType == 'text') {
      this.node.nodeValue = this.value
    }
    if (this.nodeType == 'input') {
      this.node.value = this.value
    }
  },
  // 获取 data 中的属性值
  get: function () {
    this.value = this.vm[this.name] // 触发相应属性的 get
  },
}

function Dep() {
  this.subs = []
}

Dep.prototype = {
  addSub: function (sub) {
    this.subs.push(sub)
  },

  notify: function () {
    this.subs.forEach(function (sub) {
      sub.update()
    })
  },
}

function Vue(options) {
  this.data = options.data
  var data = this.data

  observe(data, this)

  var id = options.el
  var dom = nodeToFragment(document.getElementById(id), this)

  // 编译完成后，将 dom 返回到 app 中
  document.getElementById(id).appendChild(dom)
}
```

## Compose functions

```javascript
function compose() {
  var args = arguments
  var start = args.length - 1
  return function () {
    var i = start
    var result = args[start].apply(this, arguments)
    while (i--) result = args[i].call(this, result)
    return result
  }
}
```

## 判断对象相等

```javascript
var toString = Object.prototype.toString

function isFunction(obj) {
  return toString.call(obj) === '[object Function]'
}

function eq(a, b, aStack, bStack) {
  // === 结果为 true 的区别出 +0 和 -0
  if (a === b) return a !== 0 || 1 / a === 1 / b

  // typeof null 的结果为 object ，这里做判断，是为了让有 null 的情况尽早退出函数
  if (a == null || b == null) return false

  // 判断 NaN
  if (a !== a) return b !== b

  // 判断参数 a 类型，如果是基本类型，在这里可以直接返回 false
  var type = typeof a
  if (type !== 'function' && type !== 'object' && typeof b != 'object')
    return false

  // 更复杂的对象使用 deepEq 函数进行深度比较
  return deepEq(a, b, aStack, bStack)
}

function deepEq(a, b, aStack, bStack) {
  // a 和 b 的内部属性 [[class]] 相同时 返回 true
  var className = toString.call(a)
  if (className !== toString.call(b)) return false

  switch (className) {
    case '[object RegExp]':
    case '[object String]':
      return '' + a === '' + b
    case '[object Number]':
      if (+a !== +a) return +b !== +b
      return +a === 0 ? 1 / +a === 1 / b : +a === +b
    case '[object Date]':
    case '[object Boolean]':
      return +a === +b
  }

  var areArrays = className === '[object Array]'
  // 不是数组
  if (!areArrays) {
    // 过滤掉两个函数的情况
    if (typeof a != 'object' || typeof b != 'object') return false

    var aCtor = a.constructor,
      bCtor = b.constructor
    // aCtor 和 bCtor 必须都存在并且都不是 Object 构造函数的情况下，aCtor 不等于 bCtor， 那这两个对象就真的不相等啦
    if (
      aCtor == bCtor &&
      !(
        isFunction(aCtor) &&
        aCtor instanceof aCtor &&
        isFunction(bCtor) &&
        bCtor instanceof bCtor
      ) &&
      'constructor' in a &&
      'constructor' in b
    ) {
      return false
    }
  }

  aStack = aStack || []
  bStack = bStack || []
  var length = aStack.length

  // 检查是否有循环引用的部分
  while (length--) {
    if (aStack[length] === a) {
      return bStack[length] === b
    }
  }

  aStack.push(a)
  bStack.push(b)

  // 数组判断
  if (areArrays) {
    length = a.length
    if (length !== b.length) return false

    while (length--) {
      if (!eq(a[length], b[length], aStack, bStack)) return false
    }
  }
  // 对象判断
  else {
    var keys = Object.keys(a),
      key
    length = keys.length

    if (Object.keys(b).length !== length) return false
    while (length--) {
      key = keys[length]
      if (!(b.hasOwnProperty(key) && eq(a[key], b[key], aStack, bStack)))
        return false
    }
  }

  aStack.pop()
  bStack.pop()
  return true
}
```

## new 实现

```javascript
//  new 操作符
// （1）首先创建了一个新的空对象
// （2）设置原型，将对象的原型设置为函数的 prototype 对象。
// （3）让函数的 this 指向这个对象，执行构造函数的代码（为这个新对象添加属性）
// （4）判断函数的返回值类型，如果是值类型，返回创建的对象。如果是引用类型，就返回这个引用类型的对象。
// 实现:
function objectFactory() {
  let newObject = null,
    constructor = Array.prototype.shift.call(arguments),
    result = null
  // 参数判断
  if (typeof constructor !== 'function') {
    console.error('type error')
    return
  }
  // 新建一个空对象，对象的原型为构造函数的 prototype 对象
  newObject = Object.create(constructor.prototype)
  // 将 this 指向新建对象，并执行函数
  result = constructor.apply(newObject, arguments)
  // 判断返回对象
  let flag =
    result && (typeof result === 'object' || typeof result === 'function')
  // 判断返回结果
  return flag ? result : newObject
}
```

## instanceof 实现

```javascript
// instanceof 运算符用于判断构造函数的 prototype 属性是否出现在对象的原型链中的任何位置。
// 实现：
function myInstanceof(left, right) {
  let proto = Object.getPrototypeOf(left), // 获取对象的原型
    prototype = right.prototype // 获取构造函数的 prototype 对象
  // 判断构造函数的 prototype 对象是否在对象的原型链上
  while (true) {
    if (!proto) return false
    if (proto === prototype) return true
    proto = Object.getPrototypeOf(proto)
  }
}
```

## 函数重载

```javascript
;(() => {
  //IIFE+箭头函数，把要写的代码包起来，避免影响外界，这是个好习惯

  // 当函数成为对象的一个属性的时候，可以称之为该对象的方法。

  /**
   * @param {object}  一个对象，以便接下来给这个对象添加重载的函数(方法)
   * @param {name}    object被重载的函数(方法)名
   * @param {fn}      被添加进object参与重载的函数逻辑
   */
  function overload(object, name, fn) {
    var oldMethod = object[name] //存放旧函数，本办法灵魂所在，将多个fn串联起来
    object[name] = function () {
      // fn.length为fn定义时的参数个数,arguments.length为重载方法被调用时的参数个数
      if (fn.length === arguments.length) {
        //若参数个数匹配上
        return fn.apply(this, arguments) //就调用指定的函数fn
      } else if (typeof oldMethod === 'function') {
        //若参数个数不匹配
        return oldMethod.apply(this, arguments) //就调旧函数
        //注意：当多次调用overload()时，旧函数中
        //又有旧函数,层层嵌套,递归地执行if..else
        //判断,直到找到参数个数匹配的fn
      }
    }
  }

  // 不传参数时
  function fn0() {
    return 'no param'
  }
  // 传1个参数
  function fn1(param1) {
    return '1 param:' + param1
  }
  // 传两个参数时，返回param1和param2都匹配的name
  function fn2(param1, param2) {
    return '2 param:' + [param1, param2]
  }

  let obj = {} //定义一个对象，以便接下来给它的方法进行重载

  overload(obj, 'fn', fn0) //给obj添加第1个重载的函数
  overload(obj, 'fn', fn1) //给obj添加第2个重载的函数
  overload(obj, 'fn', fn2) //给obj添加第3个重载的函数

  console.log(obj.fn()) //>> no param
  console.log(obj.fn(1)) //>> 1 param:1
  console.log(obj.fn(1, 2)) //>> 2 param:1,2
})()
```

## 将一个数组类型转换成一个对象 & reduce 应用

```javascript
const arr = [
  {
    username: 'makai',
    displayname: '馆长',
    email: 'guanzhang@coffe1891.com',
  },
  {
    username: 'xiaoer',
    displayname: '小二',
    email: 'xiaoer@coffe1891.com',
  },
  {
    username: 'zhanggui',
    displayname: '掌柜',
    email: null,
  },
]

function callback(acc, person) {
  //下面这句用到了扩展运算符...acc，表示把acc对象的属性“肢解”开，和新的属性一起
  //以一个新的对象返回
  return {
    ...acc,
    [person.username]: person,
  }
}
const obj = arr.reduce(callback, {}) //这里的初始值为{}
console.log(obj)

/**
 * 展开一个超大的array
 */

const arr = [
  'Algar,Bardle,Mr. Barker,Barton',
  'Baynes,Bradstreet,Sam Brown',
  'Monsieur Dubugue,Birdy Edwards,Forbes,Forrester',
  'Gregory,Tobias Gregson,Hill',
  'Stanley Hopkins,Athelney Jones',
]

function callback(acc, line) {
  return acc.concat(line.split(/,/g))
}
const arr1 = arr.reduce(callback, [])
console.log(arr1)

/**
 * 完成对数组的两次计算，但只遍历一次
 */

const arr = [0.3, 1.2, 3.4, 0.2, 3.2, 5.5, 0.4]

function callback(acc, reading) {
  return {
    minReading: Math.min(acc.minReading, reading),
    maxReading: Math.max(acc.maxReading, reading),
  }
}
const initMinMax = {
  minReading: Number.MAX_VALUE,
  maxReading: Number.MIN_VALUE,
}
const result = arr.reduce(callback, initMinMax)
console.log(result)
//>> {minReading: 0.2, maxReading: 5.5}

/**
 * 在一次调用动作里，同时实现mapping和filter 的功能
 */

function notEmptyEmail(x) {
  return x.email !== null && x.email !== undefined
}

function getLastSeen(x) {
  return x.lastSeen
}

function greater(a, b) {
  return a > b ? a : b
}

const peopleWithEmail = peopleArr.filter(notEmptyEmail)
const lastSeenDates = peopleWithEmail.map(getLastSeen)
const mostRecent = lastSeenDates.reduce(greater, '')

console.log(mostRecent)
//>> 2019-05-13T11:07:22+00:00

/**
 * 运行异步方法队列
 */

function fetchMessages(username) {
  return fetch(`https://example.com/api/messages/${username}`).then(
    (response) => response.json()
  )
}

function getUsername(person) {
  return person.username
}

async function chainedFetchMessages(p, username) {
  // 在这个函数体内, p 是一个promise对象，等待它执行完毕,
  // 然后运行 fetchMessages().
  const obj = await p
  const data = await fetchMessages(username)
  return {
    ...obj,
    [username]: data,
  }
}

const msgObj = peopleArr
  .map(getUsername)
  .reduce(chainedFetchMessages, Promise.resolve({}))
  .then(console.log)
//>> {glestrade: [ … ], mholmes: [ … ], iadler: [ … ]}
```

## 发布订阅模式

```javascript
/* 观察者模式 */

// 定义发布者类
class Publisher {
  constructor() {
    this.observers = []
    console.log('Publisher created')
  }
  // 增加订阅者
  add(observer) {
    console.log('Publisher.add invoked')
    this.observers.push(observer)
  }
  // 移除订阅者
  remove(observer) {
    console.log('Publisher.remove invoked')
    this.observers.forEach((item, i) => {
      if (item === observer) {
        this.observers.splice(i, 1)
      }
    })
  }
  // 通知所有订阅者
  notify() {
    console.log('Publisher.notify invoked')
    this.observers.forEach((observer) => {
      observer.update(this)
    })
  }
}

// 定义订阅者类
class Observer {
  constructor() {
    console.log('Observer created')
  }

  update() {
    console.log('Observer.update invoked')
  }
}

/* 发布订阅模式 - 事件总线 */

let eventEmitter = {
  // 缓存列表
  list: {},
  // 订阅
  on(event, fn) {
    let _this = this
    // 如果对象中没有对应的 event 值，也就是说明没有订阅过，就给 event 创建个缓存列表
    // 如有对象中有相应的 event 值，把 fn 添加到对应 event 的缓存列表里
    ;(_this.list[event] || (_this.list[event] = [])).push(fn)
    return _this
  },
  // 监听一次
  once(event, fn) {
    // 先绑定，调用后删除
    let _this = this

    function on() {
      _this.off(event, on)
      fn.apply(_this, arguments)
    }
    on.fn = fn
    _this.on(event, on)
    return _this
  },
  // 取消订阅
  off(event, fn) {
    let _this = this
    let fns = _this.list[event]
    // 如果缓存列表中没有相应的 fn，返回false
    if (!fns) return false
    if (!fn) {
      // 如果没有传 fn 的话，就会将 event 值对应缓存列表中的 fn 都清空
      fns && (fns.length = 0)
    } else {
      // 若有 fn，遍历缓存列表，看看传入的 fn 与哪个函数相同，如果相同就直接从缓存列表中删掉即可
      let cb
      for (let i = 0, cbLen = fns.length; i < cbLen; i++) {
        cb = fns[i]
        if (cb === fn || cb.fn === fn) {
          fns.splice(i, 1)
          break
        }
      }
    }
    return _this
  },
  // 发布
  emit() {
    let _this = this
    // 第一个参数是对应的 event 值，直接用数组的 shift 方法取出
    let event = [].shift.call(arguments),
      fns = _this.list[event]
    // 如果缓存列表里没有 fn 就返回 false
    if (!fns || fns.length === 0) {
      return false
    }
    // 遍历 event 值对应的缓存列表，依次执行 fn
    fns.forEach((fn) => {
      fn.apply(_this, arguments)
    })
    return _this
  },
}

function user1(content) {
  console.log('用户1订阅了:', content)
}

function user2(content) {
  console.log('用户2订阅了:', content)
}

function user3(content) {
  console.log('用户3订阅了:', content)
}

function user4(content) {
  console.log('用户4订阅了:', content)
}

// 订阅
eventEmitter.on('article1', user1)
eventEmitter.on('article1', user2)
eventEmitter.on('article1', user3)

// 取消user2方法的订阅
eventEmitter.off('article1', user2)

eventEmitter.once('article2', user4)

// 发布
eventEmitter.emit('article1', 'Javascript 发布-订阅模式')
eventEmitter.emit('article1', 'Javascript 发布-订阅模式')
eventEmitter.emit('article2', 'Javascript 观察者模式')
eventEmitter.emit('article2', 'Javascript 观察者模式')

// eventEmitter.on('article1', user3).emit('article1', 'test111');

/*>>
  用户1订阅了: Javascript 发布-订阅模式
  用户3订阅了: Javascript 发布-订阅模式
  用户1订阅了: Javascript 发布-订阅模式
  用户3订阅了: Javascript 发布-订阅模式
  用户4订阅了: Javascript 观察者模式
*/
```

## promise 实现

```javascript
const PENDING = 'pending'
const RESOLVED = 'resolved'
const REJECTED = 'rejected'

function MyPromise(fn) {
  // 保存初始化状态
  var self = this
  // 初始化状态
  this.state = PENDING
  // 用于保存 resolve 或者 rejected 传入的值
  this.value = null
  // 用于保存 resolve 的回调函数
  this.resolvedCallbacks = []
  // 用于保存 reject 的回调函数
  this.rejectedCallbacks = []

  // 状态转变为 resolved 方法
  function resolve(value) {
    // 判断传入元素是否为 Promise 值，如果是，则状态改变必须等待前一个状态改变后再进行改变
    if (value instanceof MyPromise) {
      return value.then(resolve, reject)
    }
    // 保证代码的执行顺序为本轮事件循环的末尾
    setTimeout(() => {
      // 只有状态为 pending 时才能转变，
      if (self.state === PENDING) {
        // 修改状态
        self.state = RESOLVED
        // 设置传入的值
        self.value = value
        // 执行回调函数
        self.resolvedCallbacks.forEach((callback) => {
          callback(value)
        })
      }
    }, 0)
  }

  // 状态转变为 rejected 方法
  function reject(value) {
    // 保证代码的执行顺序为本轮事件循环的末尾
    setTimeout(() => {
      // 只有状态为 pending 时才能转变
      if (self.state === PENDING) {
        // 修改状态
        self.state = REJECTED
        // 设置传入的值
        self.value = value
        // 执行回调函数
        self.rejectedCallbacks.forEach((callback) => {
          callback(value)
        })
      }
    }, 0)
  }
  // 将两个方法传入函数执行
  try {
    fn(resolve, reject)
  } catch (e) {
    // 遇到错误时，捕获错误，执行 reject 函数
    reject(e)
  }
}

MyPromise.prototype.then = function (onResolved, onRejected) {
  // 首先判断两个参数是否为函数类型，因为这两个参数是可选参数
  onResolved =
    typeof onResolved === 'function'
      ? onResolved
      : function (value) {
          return value
        }
  onRejected =
    typeof onRejected === 'function'
      ? onRejected
      : function (error) {
          throw error
        }
  // 如果是等待状态，则将函数加入对应列表中
  if (this.state === PENDING) {
    this.resolvedCallbacks.push(onResolved)
    this.rejectedCallbacks.push(onRejected)
  }
  // 如果状态已经凝固，则直接执行对应状态的函数
  if (this.state === RESOLVED) {
    onResolved(this.value)
  }
  if (this.state === REJECTED) {
    onRejected(this.value)
  }
}
```

## Promise.prototype.finally

```javascript
/**
 * @param {Promise<any>} promise
 * @param {() => void} onFinally
 * @returns {Promise<any>}
 */
async function myFinally(promise, onFinally) {
  try {
    const val = await promise
    await onFinally()
    return val
  } catch (error) {
    await onFinally()
    throw error
  }
}
```

## Promise 封装

```javascript
function promisify(f) {
  return function (...args) {
    // 返回一个包装函数（wrapper-function） (*)
    return new Promise((resolve, reject) => {
      function callback(err, result) {
        // 我们对 f 的自定义的回调 (**)
        if (err) {
          reject(err)
        } else {
          resolve(result)
        }
      }

      args.push(callback) // 将我们的自定义的回调附加到 f 参数（arguments）的末尾

      f.call(this, ...args) // 调用原始的函数
    })
  }
}
```

## Promise.all 实现

```javascript
function Promise_all(promises) {
  return new Promise((resolve, reject) => {
    let results = []
    let pending = promises.length
    for (let i = 0; i < promises.length; i++) {
      promises[i]
        .then((result) => {
          results[i] = result
          pending--
          if (pending == 0) resolve(results)
        })
        .catch(reject)
    }
    if (promises.length == 0) resolve(results)
  })
}

// Test code.
Promise_all([]).then((array) => {
  console.log('This should be []:', array)
})

function soon(val) {
  return new Promise((resolve) => {
    setTimeout(() => resolve(val), Math.random() * 500)
  })
}
Promise_all([soon(1), soon(2), soon(3)]).then((array) => {
  console.log('This should be [1, 2, 3]:', array)
})
Promise_all([soon(1), Promise.reject('X'), soon(3)])
  .then((array) => {
    console.log('We should not get here')
  })
  .catch((error) => {
    if (error != 'X') {
      console.log('Unexpected failure:', error)
    }
  })
```

## Promise.allSettled 实现

```javascript
/**
 * @param {Array<any>} promises - notice that input might contains non-promises
 * @return {Promise<Array<{status: 'fulfilled', value: any} | {status: 'rejected', reason: any}>>}
 */
function allSettled(promises) {
  if (promises.length === 0) {
    return Promise.resolve([])
  }

  const results = []
  let completed = 0
  return new Promise((resolve) => {
    for (let i = 0; i < promises.length; i++) {
      Promise.resolve(promises[i])
        .then((value) => {
          results[i] = { status: 'fulfilled', value }
        })
        .catch((reason) => {
          results[i] = { status: 'rejected', reason }
        })
        .finally(() => {
          completed++
          if (completed === promises.length) {
            resolve(results)
          }
        })
    }
  })
}
```

## Promise.any 实现

```javascript
/**
 * @param {Array<Promise>} promises
 * @returns {Promise}
 */
function any(promises) {
  // return a Promise, which resolves as soon as one promise resolves
  return new Promise((resolve, reject) => {
    let isFulfilled = false
    const errors = []
    let errorCount = 0
    promises.forEach((promise, index) =>
      promise.then(
        (data) => {
          if (!isFulfilled) {
            resolve(data)
            isFulfilled = true
          }
        },
        (error) => {
          errors[index] = error
          errorCount += 1

          if (errorCount === promises.length) {
            reject(new AggregateError('none resolved', errors))
          }
        }
      )
    )
  })
}
```

## Promise.race 实现

```javascript
function race(promises) {
  return !promises.length
    ? Promise.resolve()
    : new Promise((resolve, reject) => {
        for (const promise of promises) {
          // Only the fist resolve/reject call will have effect on promise, all other calls will be ignored
          Promise.resolve(promise).then(resolve, reject)
        }
      })
}
```

## throttle Promises

Say you need to fetch some data through 100 APIs, and as soon as possible.

If you use `Promise.all()`, 100 requests go to your server at the same time, which is a burden to low spec servers.

Can you **throttle your API calls so that always maximum 5 API calls at the same time**?

You are asked to create a general `throttlePromises()` which takes an array of functions returning promises, and a number indicating the maximum concurrent pending promises.

```javascript
function throttlePromises(funcs, max) {
  const results = []
  async function doWork(iterator) {
    for (let [index, item] of iterator) {
      const result = await item()
      results[index] = result
    }
  }
  const iterator = Array.from(funcs).entries()
  const workers = Array(max).fill(iterator).map(doWork) // maps over asynchronous fn doWork, which returns array of results for each promise
  return Promise.all(workers).then(() => results)
}
```

## 插入大量节点

```javascript
;(() => {
  const ndContainer = document.getElementById('js-list')
  if (!ndContainer) {
    return
  }

  const total = 30000
  const batchSize = 4 // 每批插入的节点次数，越大越卡
  const batchCount = total / batchSize // 需要批量处理多少次
  let batchDone = 0 // 已经完成的批处理个数

  function appendItems() {
    const fragment = document.createDocumentFragment()
    for (let i = 0; i < batchSize; i++) {
      const ndItem = document.createElement('li')
      ndItem.innerText = batchDone * batchSize + i + 1
      fragment.appendChild(ndItem)
    }

    // 每次批处理只修改 1 次 DOM
    ndContainer.appendChild(fragment)

    batchDone += 1
    doBatchAppend()
  }

  function doBatchAppend() {
    if (batchDone < batchCount) {
      window.requestAnimationFrame(appendItems)
    }
  }

  // kickoff
  doBatchAppend()

  ndContainer.addEventListener('click', function (e) {
    const target = e.target
    if (target.tagName === 'LI') {
      alert(target.innerHTML)
    }
  })
})()
```

## 拆分 CPU 过载任务

```javascript
let i = 0

let start = Date.now()

function count() {
  // 将调度（scheduling）移动到开头
  if (i < 1e9 - 1e6) {
    setTimeout(count) // 安排（schedule）新的调用
  }

  do {
    i++
  } while (i % 1e6 != 0)

  if (i == 1e9) {
    alert('Done in ' + (Date.now() - start) + 'ms')
  }
}

count()

/**
 * 进度指示
 */

let i = 0

function count() {
  // 做繁重的任务的一部分 (*)
  do {
    i++
    progress.innerHTML = i
  } while (i % 1e3 != 0)

  if (i < 1e7) {
    setTimeout(count)
  }
}

count()
```

## jsonp 实现

```javascript
function jsonp(url, jsonpCallback, success) {
  let script = document.createElement('script')
  script.src = url
  script.async = true
  script.type = 'text/javascript'
  window[jsonpCallback] = function (data) {
    success && success(data)
  }
  document.body.appendChild(script)
}
jsonp('http://xxx', 'callback', function (value) {
  console.log(value)
})
```

## 获取 url 参数

```javascript
function getUrlParam(sUrl, sKey) {
  // 判断url是否合法
  try {
    new URL(sUrl)
  } catch (err) {
    return null
  }

  var paramArr = sUrl.split('?')[1].split('#')[0].split('&') // 取出每个参数的键值对放入数组
  const obj = {}
  paramArr.forEach((element) => {
    const [key, value] = element.split('=') // 取出数组中每一项的键与值
    if (obj[key] === void 0) {
      // 表示第一次遍历这个元素，直接添加到对象上面
      obj[key] = value
    } else {
      obj[key] = [].concat(obj[key], value) // 表示不是第一次遍历说明这个键已有，通过数组存起来。
    }
  })
  return sKey === void 0 ? obj : obj[sKey] || '' // 如果该方法为一个参数，则返回对象。
  //如果为两个参数，sKey存在，则返回值或数组，否则返回空字符。
}

// regx
const getURLParameters = (url) =>
  (url.match(/([^?=&]+)(=([^&]*))/g) || []).reduce(
    (a, v) => (
      (a[v.slice(0, v.indexOf('='))] = v.slice(v.indexOf('=') + 1)), a
    ),
    {}
  )
```

## 根据包名，在指定空间中创建对象

```javascript
// 输入描述：
// namespace({a: {test: 1, b: 2}}, 'a.b.c.d')
// 输出描述：
// {a: {test: 1, b: {c: {d: {}}}}}

function namespace(oNamespace, sPackage) {
  var arr = sPackage.split('.')
  var res = oNamespace // 保留对原始对象的引用

  for (var i = 0, len = arr.length; i < len; i++) {
    if (arr[i] in oNamespace) {
      // 空间名在对象中
      if (typeof oNamespace[arr[i]] !== 'object') {
        // 为原始值
        oNamespace[arr[i]] = {} // 将此属性设为空对象
      }
    } else {
      // 空间名不在对象中，建立此空间名属性，赋值为空
      oNamespace[arr[i]] = {}
    }

    oNamespace = oNamespace[arr[i]] // 将指针指向下一个空间名属性。
  }

  return res
}
```

## 颜色字符串转换

```javascript
// 将 rgb 颜色字符串转换为十六进制的形式，如 rgb(255, 255, 255) 转为 #ffffff
// 1. rgb 中每个 , 后面的空格数量不固定
// 2. 十六进制表达式使用六位小写字母
// 3. 如果输入不符合 rgb 格式，返回原始输入

function rgb2hex(rgb) {
  const rgb = rgb.match(/\d+/g)
  const hex = (n) => {
    return ('0' + Number(n).toString(16)).slice(-2)
  }
  return rgb.reduce((acc, cur) => acc + hex(cur), '#').toUpperCase()
}

/***************************************************************************/

// Use bitwise right-shift operator and mask bits with & (and) operator
// to convert a hexadecimal color code (with or without prefixed with #)
// to a string with the RGB values.

const hexToRGB = (hex) => {
  let alpha = false,
    h = hex.slice(hex.startsWith('#') ? 1 : 0)
  if (h.length === 3) h = [...h].map((x) => x + x).join('')
  else if (h.length === 8) alpha = true
  h = parseInt(h, 16)
  return (
    'rgb' +
    (alpha ? 'a' : '') +
    '(' +
    (h >>> (alpha ? 24 : 16)) +
    ', ' +
    ((h & (alpha ? 0x00ff0000 : 0x00ff00)) >>> (alpha ? 16 : 8)) +
    ', ' +
    ((h & (alpha ? 0x0000ff00 : 0x0000ff)) >>> (alpha ? 8 : 0)) +
    (alpha ? `, ${h & 0x000000ff}` : '') +
    ')'
  )
}
```

## 精确加法

```javascript
// 对于运算类操作，如 +-*/，就不能使用 toPrecision 了。正确的做法是把小数转成整数后再运算
function add(num1, num2) {
  const num1Digits = (num1.toString().split('.')[1] || '').length
  const num2Digits = (num2.toString().split('.')[1] || '').length
  const baseNum = Math.pow(10, Math.max(num1Digits, num2Digits))
  return (num1 * baseNum + num2 * baseNum) / baseNum
}
```

## 模板字符串

```javascript
// 实现一个 render(template, context) 方法，将 template 中的占位符用 context 填充。
// 不需要有控制流成分（如 循环、条件 等等），只要有变量替换功能即可；
// 级联的变量也可以展开；
// 被转义的的分隔符 { 和 } 不应该被渲染，分隔符与变量之间允许有空白字符。
// var obj = {name:"二月",age:"15"};
// var str = "{{name}}很厉害，才{{age}}岁";
// 输出：二月很厉害，才15岁。

function render(template, context) {
  return template.replace(/\{\{(.*?)\}\}/g, (match, key) => context[key.trim()])
}
```

## Partial function

```javascript
// add(1) => 1
// add(1, 2) => 3
// add(1)(2)(3) => 6
// add(1)(2, 3) => 6
// add(1, 2)(3) => 6
// add(1, 2, 3) => 6

function add() {
  let args = [].slice.call(arguments)
  let fn = function () {
    let fn_args = [].slice.call(arguments)
    return add.apply(null, args.concat(fn_args))
  }
  fn.toString = function () {
    return args.reduce((a, b) => a + b)
  }
  return fn
}

/**
 * @param {number} num
 */
function sum(num) {
  const func = function (num2) {
    // #4
    return num2 ? sum(num + num2) : num // #3
  }

  func.valueOf = () => num // #2
  return func // #1
}

/*** ==== Explanation  ====

We know that `sum(1)(2)` can be done by returning a function from a function. Example:


function sum(num) {
  return function(num2) {
    return num+num2;
  }
}


but we can have `sum(1)(2)....(n)` up to `n`.

How do we solve such problems? We first see a pattern, the pattern is that we need to return function `n` times.
When we see a pattern then we can write concise code using recursion. <br />

So I solved this problem using recursion. But before that let's demystify these 8 lines of code. <br />

#1: Why do we need to use `func` variable, why can't we just directly return `function(num2)...` (#4)? <br />

Because we are comparing non-primitive (Object, functions are Objects in JS) value against a primitive value (Number). <br />
`sum(1)(2)(3) == 6`

When we do such comparisons then JS has to do "type coercion". How does JS do this?

It has `valueOf` and `toString` to do that. Essentially, one of them will be called. 
What we do here is that we override that method and tell the JS engine to return our custom value (which is `num`) in our case.
That's why we needed to store #4 in a variable so that we can override the `valueOf` method.

#2: Okay, I get it that you wanted to use the `valueOf` method, but why do you on this beautiful earth want to do that? 
Because if `sum(1)(2)` will return us another function and we can't compare below -

`function(num2) { return num2 ? sum(num+num2) : num }  == 3`

So what we do is we tell the JS engine to use our `valueOf` method to return value, which is 'num'.
So we can now compare `3 == 3`

#3: Okay, then why do we have ternary on #3?
Because in case you want to use call `sum` function normally and get value out of it.
`sum(1)(2)()` will return 3

***/
```

## nest

Nests recursively objects linked to one another in a flat array.

```javascript
const nest = (items, id = null, link = 'parent_id') =>
  items
    .filter((item) => item[link] === id)
    .map((item) => ({ ...item, children: nest(items, item.id, link) }))

const comments = [
  { id: 1, parent_id: null },
  { id: 2, parent_id: 1 },
  { id: 3, parent_id: 1 },
  { id: 4, parent_id: 2 },
  { id: 5, parent_id: 4 },
]
const nestedComments = nest(comments)
// [{ id: 1, parent_id: null, children: [...] }]
```

## 对象扁平化

```javascript
const flattenObject = (obj, prefix = '') =>
  Object.keys(obj).reduce((acc, k) => {
    const pre = prefix.length ? `${prefix}.` : ''
    if (
      typeof obj[k] === 'object' &&
      obj[k] !== null &&
      Object.keys(obj[k]).length > 0
    )
      Object.assign(acc, flattenObject(obj[k], pre + k))
    else acc[pre + k] = obj[k]
    return acc
  }, {})

flattenObject({ a: { b: { c: 1 } }, d: 1 }) // { 'a.b.c': 1, d: 1 }
```

## 上题反过来

```javascript
const unflattenObject = (obj) =>
  Object.keys(obj).reduce((res, k) => {
    k.split('.').reduce(
      (acc, e, i, keys) =>
        acc[e] ||
        (acc[e] = isNaN(Number(keys[i + 1]))
          ? keys.length - 1 === i
            ? obj[k]
            : {}
          : []),
      res
    )
    return res
  }, {})

unflattenObject({ 'a.b.c': 1, d: 1 }) // { a: { b: { c: 1 } }, d: 1 }
unflattenObject({ 'a.b': 1, 'a.c': 2, d: 3 }) // { a: { b: 1, c: 2 }, d: 3 }
unflattenObject({ 'a.b.0': 8, d: 3 }) // { a: { b: [ 8 ] }, d: 3 }
```

## normalize

```javascript
// 将输入字符串转化为特定的结构化数据
// 字符串仅由小写字母和[]组成，且字符串不会包含多余的空格
// 'a, b, c' => {value: 'abc'}
// '[abc[bcd[def]]]' => {value: 'abc', children: {value: 'bcd', children: {value: 'def'}}}

function normalize(str) {
  let result = {}
  str
    .split(/[\[\]]/g)
    .filter(Boolean)
    .reduce((obj, item, index, arr) => {
      obj.value = item
      if (index !== arr.length - 1) {
        return (obj.children = {})
      }
    }, result)
  return result
}
```

## 异步并发数限制

1. `new Promise` 一旦创建，立即执行

2. 使用 `Promise.resolve().then()` 可以把任务加到微任务队列中，防止立即执行迭代方法

3. 微任务处理过程中，产生的新的微任务，会在同一事件循环内，追加到微任务队列里

4. 使用 `race` 在某个任务完成时，继续添加任务，保持任务按照最大并发数进行执行

5. 任务完成后，需要从 `doningTasks` 中移出

```javascript
function limit(count, arr, iterateFunc) {
  const tasks = []
  const doingTasks = []
  let i = 0
  const enqueue = () => {
    if (i === arr.length) {
      return Promise.resolve()
    }
    const task = Promise.resolve().then(() => iterateFunc(arr[i++]))
    tasks.push(task)
    const doing = task.then(() =>
      doingTasks.splice(doingTasks.indexOf(doing), 1)
    )
    doingTasks.push(doing)
    const res =
      doingTasks.length >= count ? Promise.race(doingTasks) : Promise.resolve()
    return res.then(enqueue)
  }
  return enqueue().then(() => Promise.all(tasks))
}

// 使用方式
const timeout = (i) => new Promise((resolve) => setTimeout(() => resolve(i), i))
limit(2, [1000, 1000, 1000, 1000], timeout).then((res) => console.log(res))
```

## 异步串行和异步并行

```javascript
function asyncAdd(a, b, callback) {
  setTimeout(function () {
    callback(null, a + b)
  }, 500)
}

// 1. Promisify
const promiseAdd = (a, b) =>
  new Promise((resolve, reject) => {
    asyncAdd(a, b, (err, res) => {
      if (err) {
        reject(err)
      } else {
        resolve(res)
      }
    })
  })

// 2. 串行处理
async function serialSum(...args) {
  return args.reduce(
    (task, now) => task.then((res) => promiseAdd(res, now)),
    Promise.resolve(0)
  )
}

// 3. 并行处理
async function parallelSum(...args) {
  if (args.length === 1) return args[0]

  const tasks = []

  for (let i = 0; i < args.length; i += 2) {
    tasks.push(promiseAdd(args[i], args[i + 1] || 0))
  }
  const results = await Promise.all(tasks)

  return parallelSum(...results)
}
```

## 并发执行 async 函数

```javascript
async function handleList() {
  const listPromise = await getList()
  // ...
  await submit(listData)
}

async function handleAnotherList() {
  const anotherListPromise = await getAnotherList()
  // ...
  await submit(anotherListData)
}

// 方法一
;(async () => {
  const handleListPromise = handleList()
  const handleAnotherListPromise = handleAnotherList()
  await handleListPromise
  await handleAnotherListPromise
})()(
  // 方法二
  async () => {
    Promise.all([handleList(), handleAnotherList()]).then()
  }
)()
```

## async 错误捕获

```javascript
// to.js
export default function to(promise) {
  return promise
    .then((data) => {
      return [null, data]
    })
    .catch((err) => [err])
}

import to from './to.js'

async function asyncTask() {
  let err, user, savedTask
  ;[err, user] = await to(UserModel.findById(1))
  if (!user) throw new CustomerError('No user found')
  ;[err, savedTask] = await to(
    TaskModel({ userId: user.id, name: 'Demo Task' })
  )
  if (err) throw new CustomError('Error occurred while saving task')

  if (user.notificationsEnabled) {
    const [err] = await to(
      NotificationService.sendNotification(user.id, 'Task Created')
    )
    if (err) console.error('Just log the error and continue flow')
  }
}
```

## 红绿灯问题

```javascript
// 红灯三秒亮一次，绿灯一秒亮一次，黄灯2秒亮一次；如何让三个灯不断交替重复亮灯？

function red() {
  console.log('red')
}
function green() {
  console.log('green')
}
function yellow() {
  console.log('yellow')
}

var light = function (timmer, cb) {
  return new Promise(function (resolve, reject) {
    setTimeout(function () {
      cb()
      resolve()
    }, timmer)
  })
}

var step = function () {
  Promise.resolve()
    .then(function () {
      return light(3000, red)
    })
    .then(function () {
      return light(2000, green)
    })
    .then(function () {
      return light(1000, yellow)
    })
    .then(function () {
      step()
    })
}

step()
```

## autobind 装饰器

```javascript
class Person {
  @autobind
  getPerson() {
    return this
  }
}

let person = new Person()
let { getPerson } = person

getPerson() === person
// true

const { defineProperty, getPrototypeOf } = Object

function bind(fn, context) {
  if (fn.bind) {
    return fn.bind(context)
  } else {
    return function __autobind__() {
      return fn.apply(context, arguments)
    }
  }
}

function createDefaultSetter(key) {
  return function set(newValue) {
    Object.defineProperty(this, key, {
      configurable: true,
      writable: true,
      enumerable: true,
      value: newValue,
    })

    return newValue
  }
}

function autobind(target, key, { value: fn, configurable, enumerable }) {
  if (typeof fn !== 'function') {
    throw new SyntaxError(`@autobind can only be used on functions, not: ${fn}`)
  }

  const { constructor } = target

  return {
    configurable,
    enumerable,

    get() {
      /**
       * 使用这种方式相当于替换了这个函数，所以当比如
       * Class.prototype.hasOwnProperty(key) 的时候，为了正确返回
       * 所以这里做了 this 的判断
       */
      if (this === target) {
        return fn
      }

      const boundFn = bind(fn, this)

      defineProperty(this, key, {
        configurable: true,
        writable: true,
        enumerable: false,
        value: boundFn,
      })

      return boundFn
    },
    set: createDefaultSetter(key),
  }
}
```

## mixin 装饰器

```javascript
const SingerMixin = {
  sing(sound) {
    alert(sound)
  },
}

const FlyMixin = {
  // All types of property descriptors are supported
  get speed() {},
  fly() {},
  land() {},
}

@mixin(SingerMixin, FlyMixin)
class Bird {
  singMatingCall() {
    this.sing('tweet tweet')
  }
}

var bird = new Bird()
bird.singMatingCall()
// alerts "tweet tweet"

function mixin(...mixins) {
  return (target) => {
    if (!mixins.length) {
      throw new SyntaxError(
        `@mixin() class ${target.name} requires at least one mixin as an argument`
      )
    }

    for (let i = 0, l = mixins.length; i < l; i++) {
      const descs = Object.getOwnPropertyDescriptors(mixins[i])
      const keys = Object.getOwnPropertyNames(descs)

      for (let j = 0, k = keys.length; j < k; j++) {
        const key = keys[j]

        if (!target.prototype.hasOwnProperty(key)) {
          Object.defineProperty(target.prototype, key, descs[key])
        }
      }
    }
  }
}
```

## Storage 单例 (静态方法版)

```javascript
// 定义Storage
class Storage {
  static getInstance() {
    // 判断是否已经new过1个实例
    if (!Storage.instance) {
      // 若这个唯一的实例不存在，那么先创建它
      Storage.instance = new Storage()
    }
    // 如果这个唯一的实例已经存在，则直接返回
    return Storage.instance
  }
  getItem(key) {
    return localStorage.getItem(key)
  }
  setItem(key, value) {
    return localStorage.setItem(key, value)
  }
}

const storage1 = Storage.getInstance()
const storage2 = Storage.getInstance()

storage1.setItem('name', '李雷')
// 李雷
storage1.getItem('name')
// 也是李雷
storage2.getItem('name')

// 返回true
storage1 === storage2
```

## Storage 单例 (闭包版)

```javascript
// 先实现一个基础的StorageBase类，把getItem和setItem方法放在它的原型链上
function StorageBase() {}
StorageBase.prototype.getItem = function (key) {
  return localStorage.getItem(key)
}
StorageBase.prototype.setItem = function (key, value) {
  return localStorage.setItem(key, value)
}

// 以闭包的形式创建一个引用自由变量的构造函数
const Storage = (function () {
  let instance = null
  return function () {
    // 判断自由变量是否为null
    if (!instance) {
      // 如果为null则new出唯一实例
      instance = new StorageBase()
    }
    return instance
  }
})()

// 这里其实不用 new Storage 的形式调用，直接 Storage() 也会有一样的效果
const storage1 = new Storage()
const storage2 = new Storage()

storage1.setItem('name', '李雷')
// 李雷
storage1.getItem('name')
// 也是李雷
storage2.getItem('name')

// 返回true
storage1 === storage2
```

## 类单例化

```javascript
const singletonify = (className) => {
  return new Proxy(className.prototype.constructor, {
    instance: null,
    construct: (target, argumentsList) => {
      if (!this.instance) this.instance = new target(...argumentsList)
      return this.instance
    },
  })
}
```

## LRU 算法实现

```javascript
// ./LRU.ts
export class LRUCache {
  capacity: number; // 容量
  cache: Map<number, number | null>; // 缓存
  constructor(capacity: number) {
    this.capacity = capacity;
    this.cache = new Map();
  }
  get(key: number): number {
    if (this.cache.has(key)) {
      let temp = this.cache.get(key) as number;
      //访问到的 key 若在缓存中，将其提前
      this.cache.delete(key);
      this.cache.set(key, temp);
      return temp;
    }
    return -1;
  }
  put(key: number, value: number): void {
    if (this.cache.has(key)) {
      this.cache.delete(key);
      //存在则删除，if 结束再提前
    } else if (this.cache.size >= this.capacity) {
      // 超过缓存长度,淘汰最近没使用的
      this.cache.delete(this.cache.keys().next().value);
      console.log(`refresh: key:${key} , value:${value}`)
    }
    this.cache.set(key, value);
  }
  toString(){
    console.log('capacity',this.capacity)
    console.table(this.cache)
  }
}

// ./index.ts
import {LRUCache} from './lru'
const list = new LRUCache(4)
list.put(2,2)   // 入 2，剩余容量3
list.put(3,3)   // 入 3，剩余容量2
list.put(4,4)   // 入 4，剩余容量1
list.put(5,5)   // 入 5，已满    从头至尾         2-3-4-5
list.put(4,4)   // 入4，已存在 ——> 置队尾         2-3-5-4
list.put(1,1)   // 入1，不存在 ——> 删除队首 插入1  3-5-4-1
list.get(3)     // 获取3，刷新3——> 置队尾         5-4-1-3
list.toString()
```

## Axios 中的适配器

```javascript
// 若用户未手动配置适配器，则使用默认的适配器
var adapter = config.adapter || defaults.adapter;

  // dispatchRequest方法的末尾调用的是适配器方法
  return adapter(config).then(function onAdapterResolution(response) {
    // 请求成功的回调
    throwIfCancellationRequested(config);

    // 转换响应体
    response.data = transformData(
      response.data,
      response.headers,
      config.transformResponse
    );

    return response;
  }, function onAdapterRejection(reason) {
    // 请求失败的回调
    if (!isCancel(reason)) {
      throwIfCancellationRequested(config);

      // 转换响应体
      if (reason && reason.response) {
        reason.response.data = transformData(
          reason.response.data,
          reason.response.headers,
          config.transformResponse
        );
      }
    }

    return Promise.reject(reason);
  });

// 默认的适配器
function getDefaultAdapter() {
  var adapter;
  // 判断当前是否是node环境
  if (typeof process !== 'undefined' && Object.prototype.toString.call(process) === '[object process]') {
    // 如果是node环境，调用node专属的http适配器
    adapter = require('./adapters/http');
  } else if (typeof XMLHttpRequest !== 'undefined') {
    // 如果是浏览器环境，调用基于xhr的适配器
    adapter = require('./adapters/xhr');
  }
  return adapter;
}

// http适配器
module.exports = function httpAdapter(config) {
  return new Promise(function dispatchHttpRequest(resolvePromise, rejectPromise) {
    // 具体逻辑
  }
}

// xhr适配器
module.exports = function xhrAdapter(config) {
  return new Promise(function dispatchXhrRequest(resolve, reject) {
    // 具体逻辑
  }
}
```

## 图片懒加载

```javascript
function isVisible(e) {
  const position = e.getBoundingClientRect()
  const windowHeight = document.docuemtnElement.clientHeight
  // 顶部边缘可见
  const topVisible = position.top > 0 && position.top < windowHeight
  // 底部边缘可见
  const bottomVisible = position.bottom < windowHeight && position.bottom > 0

  return topVisibile || bottomVisible
}

function imageLazyLoad() {
  const images = document.querySelectorAll('img')

  for (let img of images) {
    const realSrc = img.dataset.src

    if (!realSrc) continue

    if (isVisible(img)) {
      img.src = realSrc
      img.dataset.src = ''
    }
  }
}
```

## 图片预加载 (虚拟代理)

```javascript
class PreLoadImage {
  constructor(imgNode) {
    // 获取真实的DOM节点
    this.imgNode = imgNode
  }

  // 操作img节点的src属性
  setSrc(imgUrl) {
    this.imgNode.src = imgUrl
  }
}

class ProxyImage {
  // 占位图的url地址
  static LOADING_URL = 'xxxxxx'

  constructor(targetImage) {
    // 目标Image，即PreLoadImage实例
    this.targetImage = targetImage
  }

  // 该方法主要操作虚拟Image，完成加载
  setSrc(targetUrl) {
    // 真实img节点初始化时展示的是一个占位图
    this.targetImage.setSrc(ProxyImage.LOADING_URL)
    // 创建一个帮我们加载图片的虚拟Image实例
    const virtualImage = new Image()
    // 监听目标图片加载的情况，完成时再将DOM上的真实img节点的src属性设置为目标图片的url
    virtualImage.onload = () => {
      this.targetImage.setSrc(targetUrl)
    }
    // 设置src属性，虚拟Image实例开始加载图片
    virtualImage.src = targetUrl
  }
}
```

## 函数装饰器—once 函数（只执行一次）

```javascript
function once(fn, replacer = null) {
  return function (...args) {
    if (fn) {
      const ret = fn.apply(this, args)
      fn = null
      return ret
    }
    if (replacer) {
      return replacer.apply(this, args)
    }
  }
}

// const obj = {
//   init: once(() => {
//     console.log('Initializer has been called.');
//   }, () => {
//     throw new Error('This method should be called only once.');
//   }),
// }

// obj.init();
// obj.init();
```

## 函数拦截器

```javascript
function intercept(fn, { beforeCall = null, afterCall = null }) {
  return function (...args) {
    if (!beforeCall || beforeCall.call(this, args) !== false) {
      // 如果beforeCall返回false，不执行后续函数
      const ret = fn.apply(this, args)
      if (afterCall) return afterCall.call(this, ret)
      return ret
    }
  }
}
```

## 高阶函数

```javascript
function continous(reducer) {
  return function (...args) {
    return args.reduce((a, b) => reducer(a, b))
  }
}

function fold(fn) {
  return function (...args) {
    const lastArg = args[args.length - 1]
    if (lastArg.length) {
      return fn.call(this, ...args.slice(0, -1), ...lastArg)
    }
    return fn.call(this, ...args)
  }
}

function reverse(fn) {
  return function (...args) {
    return fn.apply(this, args.reverse())
  }
}

function spread(fn) {
  return function (first, ...rest) {
    return fn.call(this, first, rest)
  }
}

function pipe(...fns) {
  return function (input) {
    return fns.reduce((a, b) => {
      return b.call(this, a)
    }, input)
  }
}
```

## 异步信号

有若干个用户参与，每个用户从 1 到 10 中选择一个数字作为幸运数字，而系统一秒钟随机产生一个 1 到 10 的数字，若这个数字和用户的幸运数字相同，则该用户胜出。

```javascript
function defer() {
  const deferred = {}
  deferred.promise = new Promise((resolve, reject) => {
    deferred.resolve = resolve
    deferred.reject = reject
  })
  return deferred
}

const _state = Symbol('state')
const _checkers = Symbol('checker')

export class Signal {
  constructor(initState) {
    this[_state] = initState
    this[_checkers] = new Map()
  }

  get state() {
    return this[_state]
  }

  set state(value) {
    // 每次状态变化时，检查未结束的 defer 对象
    ;[...this[_checkers]].forEach(([promise, { type, deferred, state }]) => {
      if (
        (type === 'while' && value !== state) || // 当信号状态改变时，while 信号结束
        (type === 'until' && value === state) // 当信号状态改变为对应的 state 时，until 信号结束
      ) {
        deferred.resolve(value)
        this[_checkers].delete(promise)
      }
    })
    this[_state] = value
  }

  while(state) {
    const deferred = defer()
    if (state !== this[_state]) {
      // 如果当前状态不是 while 状态， while 的 deferred 结束
      deferred.resolve(this[_state])
    } else {
      // 否则将它添加到 checkers 列表中等待后续检查
      this[_checkers].set(deferred.promise, { type: 'while', deferred, state })
    }
    return deferred.promise
  }

  until(state) {
    const deferred = defer()
    if (state === this[_state]) {
      // 如果当前状态就是 until 状态， until 的 deferred 结束
      deferred.resolve(this[_state])
    } else {
      // 否则将它添加到 checkers 列表中等待后续检查
      this[_checkers].set(deferred.promise, { type: 'until', deferred, state })
    }
    return deferred.promise
  }

  delete(promise) {
    this[_checkers].delete(promise)
  }

  deleteAll() {
    this[_checkers].clear()
  }
}
```

## 动画插值 & 缓动函数

```javascript
/*
  @target 目标元素
  @prop CSS属性
  @duration 动画周期
  @start 动画开始时，CSS属性的值
  @end 动画结束时，CSS属性值
  @interpolate 插值函数
*/
function animate({
  target,
  prop,
  duration,
  start,
  end,
  easing,
  interpolate,
} = {}) {
  const startTime = Date.now()

  return new Promise((resolve) => {
    function update() {
      const t = Date.now() - startTime
      const p = Math.min(t / duration, 1)

      target.style[prop] = interpolate(start, end, easing ? easing(p) : p)
      if (p < 1) {
        requestAnimationFrame(update)
      } else {
        resolve(p)
      }
    }
    update()
  })
}
```

如上代码所示，`interpolate(start, end, p)`这个函数的返回值就是根据`p`对应的比例落在`start`到`end`之间的值，也叫做**插值**。而`p`的值是在\[t/duration, 1]之间 （也就是\[0,1]之间)，所以这里的插值简单来说，表示根据动画的起始值（start）和动画的结束值（end)，在当前时间下计算出的位于 start 和 end 之间的值。

我们看到，匀速运动使用线性插值`lerp`函数，匀加速运动在线性插值前将`p`改变为`p`平方，而匀减速运动在线性插值前将`p`改变为`p*(2-p)`，实际上其他的运动形式也可以用这个模型处理，所以我们可以将改变`p`的过程抽象出来，叫做**缓动函数(easing)**。

## Memoization

caches the result once called, so when same arguments are passed in, the result will be returned right away

```javascript
/**
 * @param {Function} func
 * @param {(args:[]) => string }  [resolver] - cache key generator
 */
function memo(func, resolver = (...args) => args.join('_')) {
  const cache = new Map()

  return function (...args) {
    const cacheKey = resolver(...args)
    if (cache.has(cacheKey)) {
      return cache.get(cacheKey)
    }
    const value = func.apply(this, args)
    cache.set(cacheKey, value)
    return value
  }
}
```

## Find corresponding node

Given two same DOM tree **A**, **B**, and an Element **a** in **A**, find the corresponding Element **b** in **B**.

By **corresponding**, we mean **a** and **b** have the same relative position to their DOM tree root.

```javascript
/**
 * @param {HTMLElement} rootA
 * @param {HTMLElement} rootB - rootA and rootB are clone of each other
 * @param {HTMLElement} nodeA
 */
const findCorrespondingNode = (rootA, rootB, target) => {
  if (rootA === target) return rootB
  // 1. get the path Array<number>
  const path = []
  let node = target
  while (node !== rootA) {
    const parent = node.parentElement
    const children = Array.from(parent.children)
    const index = children.indexOf(node)
    path.push(index)
    node = parent
  }

  // 2. apply the path(reversed) to rootB
  return path.reduceRight((result, index) => result.children[index], rootB)
}
```

## Object.assign()

```javascript
/**
 * @param {any} target
 * @param {any[]} sources
 * @return {object}
 */
function objectAssign(target, ...sources) {
  if (target === null || target === undefined) {
    throw new Error('Not an object')
  }

  if (typeof target !== `object`) {
    target = new target.__proto__.constructor(target)
  }

  for (const source of sources) {
    if (source === null || source === undefined) {
      continue
    }

    Object.defineProperties(target, Object.getOwnPropertyDescriptors(source))

    for (const symbol of Object.getOwnPropertySymbols(source)) {
      target[symbol] = source[symbol]
    }
  }
  return target
}
```

## clearAllTimeout()

```javascript
;(() => {
  const originSetTimeout = setTimeout
  const originClearTimeout = clearTimeout
  const timers = new Set()

  window.clearAllTimeout = () => {
    for (const timerId of timers) {
      clearTimeout(timerId)
    }
  }

  window.setTimeout = (callback, time, ...args) => {
    const callbackWrapper = () => {
      callback(...args)
      timers.delete(timerId)
    }
    const timerId = originSetTimeout(callbackWrapper, time)
    timers.add(timerId)
    return timerId
  }

  window.clearTimeout = (id) => {
    originClearTimeout(id)
    timers.delete(id)
  }
})()

setTimeout(func1, 10000)
setTimeout(func2, 10000)
setTimeout(func3, 10000)

// all 3 functions are scheduled 10 seconds later
clearAllTimeout()

// all scheduled tasks are cancelled.
```

## copyToClipboard

Copies a string to the clipboard. Only works as a result of user action (i.e. inside a `click` event listener).

- Create a new `<textarea>` element, fill it with the supplied data and add it to the HTML document.

- Use `Selection.getRangeAt()`to store the selected range (if any).

- Use `Document.execCommand('copy')` to copy to the clipboard.

- Remove the `<textarea>` element from the HTML document.

- Finally, use `Selection().addRange()` to recover the original selected range (if any).

```javascript
const copyToClipboard = (str) => {
  const el = document.createElement('textarea')
  el.value = str
  el.setAttribute('readonly', '')
  el.style.position = 'absolute'
  el.style.left = '-9999px'
  document.body.appendChild(el)
  const selected =
    document.getSelection().rangeCount > 0
      ? document.getSelection().getRangeAt(0)
      : false
  el.select()
  document.execCommand('copy')
  document.body.removeChild(el)
  if (selected) {
    document.getSelection().removeAllRanges()
    document.getSelection().addRange(selected)
  }
}
```

## copyToClipboardAsync

Copies a string to the clipboard, returning a promise that resolves when the clipboard's contents have been updated.

- Check if the [Clipboard API](https://developer.mozilla.org/en-US/docs/Web/API/Clipboard_API 'Clipboard API') is available. Use an `if` statement to ensure `Navigator`, `Navigator.clipboard` and `Navigator.clipboard.writeText` are truthy.

- Use `Clipboard.writeText()` to write the given value, `str`, to the clipboard.

- Return the result of `Clipboard.writeText()`, which is a promise that resolves when the clipboard's contents have been updated.

- In case that the Clipboard API is not available, use `Promise.reject()` to reject with an appropriate message.

```javascript
const copyToClipboardAsync = (str) => {
  if (navigator && navigator.clipboard && navigator.clipboard.writeText)
    return navigator.clipboard.writeText(str)
  return Promise.reject('The Clipboard API is not available.')
}
```

## get

Retrieves a set of properties indicated by the given selectors from an object.

- Use `Array.prototype.map()` for each selector, `String.prototype.replace()` to replace square brackets with dots.

- Use `String.prototype.split('.')` to split each selector.

- Use `Array.prototype.filter()` to remove empty values and `Array.prototype.reduce()` to get the value indicated by each selector.

```javascript
const get = (from, ...selectors) =>
  [...selectors].map((s) =>
    s
      .replace(/\[([^\[\]]*)\]/g, '.$1.')
      .split('.')
      .filter((t) => t !== '')
      .reduce((prev, cur) => prev && prev[cur], from)
  )
```

## set

[\_.set(object, path, value)](https://lodash.com/docs/4.17.15#set '_.set(object, path, value)') is a handy method to updating an object without checking the property existence.

```javascript
function set(obj, path, value) {
  path = Array.isArray(path)
    ? path
    : path.replace('[', '.').replace(']', '').split('.')
  src = obj
  path.forEach((key, index, array) => {
    if (index == path.length - 1) {
      src[key] = value
    } else {
      if (!src.hasOwnProperty(key)) {
        // if the key doesn't exist on object
        const next = array[index + 1]
        src[key] = String(Number(next)) === next ? [] : {} // create a new object if next is item in array is not a number
      }
      src = src[key]
    }
  })
}
```

## highlight keywords in HTML string

Suppose you are implementing an auto-complete in search input.

When keywords are typed, you need to **highlight the keywords**, how would you do that?

To simplify things, you need to create a function `highlightKeywords(html:string, keywords: string[])`, which wraps the keywords in html string, with `<em>` tag.

```javascript
/**
 * @param {string} html
 * @param {string[]} keywords
 */
function highlightKeywords(html, keywords) {
  // your code here
  const regexp = new RegExp(keywords.join('|'), 'gi')
  return html
    .split(' ')
    .map((word) => {
      if (keywords.includes(word)) return `<em>${word}</em>`
      return word
        .replace(regexp, (w) => `<em>${w}</em>`)
        .replace('</em><em>', '')
    })
    .join(' ')
}
```

## call APIs with pagination

Suppose we have a `/list` API, which returns an array `items`.

// fetchList is provided for you

const fetchList = (since?: number) => Promise<{items: Array<{id: number}>}>

1. for initial request, we just fetch `fetchList`. and get the last item id from response.

2. for next page, we need to call `fetchList(lastItemId)`.

3. repeat above process.

The `/list` API only gives us 5 items at a time, with server-side filtering, it might be less than 5. But if none returned, it means nothing to fetch any more and we should stop.

You are asked to create a function that could return arbitrary amount of items.

const fetchListWithAmount = (amount: number = 5) { }

```javascript
/**
 * Using async/await loop
 */
async function fetchListWithAmount(amount = 5) {
  let cursor
  const result = []

  while (result.length < amount) {
    const { items } = await fetchList(cursor)
    if (items.length > 0) {
      result.push(...items)
      cursor = items[items.length - 1].id
    } else {
      break
    }
  }
  return result.slice(0, amount)
}

/**
 * Using async iterator
 */
async function fetchListWithAmount(amount = 5) {
  const result = []

  for await (const nextItems of fetchListIterator()) {
    result.push(...nextItems)
  }
  return result.slice(0, amount)

  function fetchListIterator() {
    let totalAmountFetched = 0
    let cursor

    return {
      [Symbol.asyncIterator]() {
        return {
          async next() {
            const { items } = await fetchList(cursor)
            // If API is exhausted OR we reached desired amount -> stop
            if (items.length === 0 || totalAmountFetched > amount) {
              return { done: true }
            }

            totalAmountFetched += items.length
            cursor = items[items.length - 1].id

            return {
              done: false,
              value: items,
            }
          },
        }
      },
    }
  }
}

/**
 * Using async generator
 */
async function fetchListWithAmount(amount = 5) {
  const result = []

  for await (const nextItems of fetchListGenerator()) {
    result.push(...nextItems)
  }
  return result.slice(0, amount)

  async function* fetchListGenerator() {
    let totalAmountFetched = 0
    let cursor

    while (totalAmountFetched < amount) {
      const { items } = await fetchList(cursor)
      if (items.length === 0) break
      cursor = items[items.length - 1].id
      totalAmountFetched += items.length
      yield items
    }
  }
}

/**
 * Using recursion and Promise
 */
function fetchListWithAmount(amount = 5) {
  return new Promise((resolve) => {
    const result = []
    getItems()

    function getItems(cursor) {
      fetchList(cursor).then(({ items }) => {
        result.push(...items)
        if (items.length === 0 || items.length >= amount) {
          return resolve(result.slice(0, amount))
        }
        getItems(items[items.length - 1].id)
      })
    }
  })
}
```

## parseCookie

Parses an HTTP Cookie header string, returning an object of all cookie name-value pairs.

```javascript
const parseCookie = (str) =>
  str
    .split(';')
    .map((v) => v.split('='))
    .reduce((acc, v) => {
      acc[decodeURIComponent(v[0].trim())] = decodeURIComponent(v[1].trim())
      return acc
    }, {})

parseCookie('foo=bar; equation=E%3Dmc%5E2')
// { foo: 'bar', equation: 'E=mc^2' }
```

## merge identical API calls

Suppose we have a utility function `getAPI()` which fetches data.

const getAPI = \<T>(

path: string, config: SomeConfig

): Promise\<T> => { ... }

const list1 = await getAPI('/list', { keyword: 'bfe'})

const list2 = await getAPI('/list', { keyword: 'dev'})

It works great. Util the UI become so complicated that same API might be called for multiple time within a relatively short period of time.

You want to avoid the unnecessary API calls, based on following assumption:

**GET API call response hardly changes within 1000ms.**

So identical GET API calls should return the same response within 1000ms. By **identical**, it means `path` and `config` are [deeply equal](https://bigfrontend.dev/problem/implement-deep-equal-isEqual 'deeply equal').

You create `getAPIWithMerging(path: string, config: SomeConfig)`, which works like following.

getAPIWithMerging('/list', { keyword: 'bfe'}).then(...) // 1st call, this will call getAPI

getAPIWithMerging('/list', { keyword: 'bfe'}).then(...) // 2nd call is identical to 1st call,&#x20;

// so getAPI is not called,&#x20;

// it resolves when 1st call resolves

getAPIWithMerging('/list', { keyword: 'dev'}).then(...)

// 3rd call is not identical, so getAPI is called

// after 1000ms

getAPIWithMerging('/list', {keyword: 'bfe'}).then(...)

// 4th call is identical to 1st call,&#x20;

// but since after 1000ms, getAPI is called.

> 📌Attention for memory leak!

Your cache system should not bloat. For this problem, you should have 5 cache entries at maximum, which means:

getAPIWithMerging('/list1', { keyword: 'bfe'}).then(...) // 1st call, call callAPI(), add a cache entry

getAPIWithMerging('/list2', { keyword: 'bfe'}).then(...) // 2nd call, call callAPI(), add a cache entry

getAPIWithMerging('/list3', { keyword: 'bfe'}).then(...) // 3rd call, call callAPI(), add a cache entry

getAPIWithMerging('/list4', { keyword: 'bfe'}).then(...) // 4th call, call callAPI(), add a cache entry

getAPIWithMerging('/list5', { keyword: 'bfe'}).then(...) // 5th call, call callAPI(), add a cache entry

getAPIWithMerging('/list6', { keyword: 'bfe'}).then(...) // 6th call, call callAPI(), add a cache entry

// cache of 1st call is removed

getAPIWithMerging('/list1', { keyword: 'bfe'}).then(...)&#x20;

// identical with 1st call, but cache of 1st call is removed

// new cache of entry is added

For test purpose, please provide a clear method to clear all cache.

getAPIWithMerging.clearCache()

```javascript
// Map<string, {promise: Promise, triggered: number}>
const cache = new Map()

const hash = (obj) => {
  switch (Object.prototype.toString.call(obj)) {
    case '[object Null]':
      return 'null'
    case '[object Undefined]':
      return 'undefined'
    case '[object Number]':
    case '[object Boolean]':
      return obj.toString()
    case '[object String]':
      return obj
    case '[object Object]':
      const keys = Object.keys(obj)
      keys.sort()
      return `{${keys.map((key) => `"${key}":${hash(obj[key])}`).join(',')}}`
    case '[obect Array]':
      return `[${obj.map((item) => hash(item)).join(',')}]`
  }
}

const MAX_CACHE = 5
const CACHE_TIME_LIMIT = 1000
/**
 * @param { string } path
 * @param { object } config
 * only plain objects, no strange input in this problem
 * @returns { Promise<any> }
 */
function getAPIWithMerging(path, config) {
  // serialize the hash, with path + config
  const requestHash = hash({ path, config })

  // cache is available
  if (cache.has(requestHash)) {
    const entry = cache.get(requestHash)
    if (Date.now() - entry.triggered <= CACHE_TIME_LIMIT) {
      return entry.promise
    }
    cache.delete(requestHash)
  }

  const promise = getAPI(path, config)
  cache.set(requestHash, {
    promise,
    triggered: Date.now(),
  })

  // remove the oldest cache
  if (cache.size > MAX_CACHE) {
    for (let [hash] of cache) {
      cache.delete(hash)
      break
    }
  }

  return promise
}

getAPIWithMerging.clearCache = () => {
  cache.clear()
}
```

## Virtual DOM&#x20;

Now you are asked to serialize/deserialize the DOM tree, like what React does.

**Note**

**Functions like event handlers and custom components are beyond the scope of this problem, you can ignore them**, just focus on basic HTML tags.

You should support:

1. TextNode (string) as children

2. single child and multiple children

3. camelCased properties.

`virtualize()` takes in a real DOM tree and create an object literal `render()` takes in a object literal presentation and recreate a DOM tree.

```javascript
/**
 * @param {HTMLElement}
 * @return {object} JSON presentation
 */
function virtualize(element) {
  // virtualize top level element
  // recursively handle the children (childNodes)
  const result = {
    type: element.tagName.toLowerCase(),
    props: {},
  }
  // props (without children)
  for (let attr of element.attributes) {
    const name = attr.name === 'class' ? 'className' : attr.name
    result.props[name] = attr.value
  }
  // children
  const children = []
  for (let node of element.childNodes) {
    if (node.nodeType === 3) {
      // text node
      children.push(node.textContent)
    } else {
      children.push(virtualize(node))
    }
  }

  result.props.children = children.length === 1 ? children[0] : children

  return result
}

/**
 * @param {object} valid JSON presentation
 * @return {HTMLElement}
 */
function render(json) {
  // create the top level emlement
  // recursively append the children
  // textnode
  if (typeof json === 'string') {
    return document.createTextNode(json)
  }

  // element
  const {
    type,
    props: { children, ...attrs },
  } = json
  const element = document.createElement(type)

  for (let [attr, value] of Object.entries(attrs)) {
    element[attr] = value
  }

  const childrenArr = Array.isArray(children) ? children : [children]

  for (let child of childrenArr) {
    element.append(render(child))
  }

  return element
}
```

## event delegation

Adds an event listener to an element with the ability to use event delegation.

```javascript
const on = (el, evt, fn, opts = {}) => {
  const delegatorFn = (e) =>
    e.target.matches(opts.target) && fn.call(e.target, e)
  el.addEventListener(
    evt,
    opts.target ? delegatorFn : fn,
    opts.options || false
  )
  if (opts.target) return delegatorFn
}

const fn = () => console.log('!')
on(document.body, 'click', fn) // logs '!' upon clicking the body
on(document.body, 'click', fn, { target: 'p' })
// logs '!' upon clicking a `p` element child of the body
on(document.body, 'click', fn, { options: true })
// use capturing instead of bubbling
```

## runAsync

Runs a function in a separate thread by using a [Web Worker](https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API/Using_web_workers 'Web Worker'), allowing long running functions to not block the UI.

- Create a `new Worker()` using a `Blob` object URL, the contents of which should be the stringified version of the supplied function.

- Immediately post the return value of calling the function back.

- Return a `new Promise()`, listening for `onmessage` and `onerror` events and resolving the data posted back from the worker, or throwing an error.

```javascript
const runAsync = (fn) => {
  const worker = new Worker(
    URL.createObjectURL(new Blob([`postMessage((${fn})());`]), {
      type: 'application/javascript; charset=utf-8',
    })
  )
  return new Promise((res, rej) => {
    worker.onmessage = ({ data }) => {
      res(data), worker.terminate()
    }
    worker.onerror = (err) => {
      rej(err), worker.terminate()
    }
  })
}

const longRunningFunction = () => {
  let result = 0
  for (let i = 0; i < 1000; i++)
    for (let j = 0; j < 700; j++)
      for (let k = 0; k < 300; k++) result = result + i + j + k

  return result
}

/*
  NOTE: Since the function is running in a different context, closures are not supported.
  The function supplied to `runAsync` gets stringified, so everything becomes literal.
  All variables and functions must be defined inside.
*/
runAsync(longRunningFunction).then(console.log) // 209685000000
runAsync(() => 10 ** 3).then(console.log) // 1000
let outsideVariable = 50
runAsync(() => typeof outsideVariable).then(console.log) // 'undefined'
```

## renderElement

Renders the given DOM tree in the specified DOM element.

- Destructure the first argument into `type` and `props`. Use `type` to determine if the given element is a text element.

- Based on the element's `type`, use either `Document.createTextNode()` or `Document.createElement()` to create the DOM element.

- Use `Object.keys()` to add attributes to the DOM element and set event listeners, as necessary.

- Use recursion to render `props.children`, if any.

- Finally, use `Node.appendChild()` to append the DOM element to the specified `container`.

```javascript
const renderElement = ({ type, props = {} }, container) => {
  const isTextElement = !type
  const element = isTextElement
    ? document.createTextNode('')
    : document.createElement(type)

  const isListener = (p) => p.startsWith('on')
  const isAttribute = (p) => !isListener(p) && p !== 'children'

  Object.keys(props).forEach((p) => {
    if (isAttribute(p)) element[p] = props[p]
    if (!isTextElement && isListener(p))
      element.addEventListener(p.toLowerCase().slice(2), props[p])
  })

  if (!isTextElement && props.children && props.children.length)
    props.children.forEach((childElement) =>
      renderElement(childElement, element)
    )

  container.appendChild(element)
}

const myElement = {
  type: 'button',
  props: {
    type: 'button',
    className: 'btn',
    onClick: () => alert('Clicked'),
    children: [{ props: { nodeValue: 'Click me' } }],
  },
}

renderElement(myElement, document.body)
```

## deepMapKeys

```javascript
const deepMapKeys = (obj, fn) =>
  Array.isArray(obj)
    ? obj.map((val) => deepMapKeys(val, fn))
    : typeof obj === 'object'
    ? Object.keys(obj).reduce((acc, current) => {
        const key = fn(current)
        const val = obj[current]
        acc[key] =
          val !== null && typeof val === 'object' ? deepMapKeys(val, fn) : val
        return acc
      }, {})
    : obj

const obj = {
  foo: '1',
  nested: {
    child: {
      withArray: [
        {
          grandChild: ['hello'],
        },
      ],
    },
  },
}

const upperKeysObj = deepMapKeys(obj, (key) => key.toUpperCase())
/*
{
  "FOO":"1",
  "NESTED":{
    "CHILD":{
      "WITHARRAY":[
        {
          "GRANDCHILD":[ 'hello' ]
        }
      ]
    }
  }
}
*/
```

## clone array

```javascript
let x = [1, 2, 3, 4]
let y = [...x]

let x = [1, 2, 3, 4]
let y = Array.from(x)

let x = [1, 2, 3, 4]
let y = x.slice()

let x = [1, 2, 3, 4]
let y = x.map((i) => i)

let x = [1, 2, 3, 4]
let y = x.filter(() => true)

let x = [1, 2, 3, 4]
let y = Object.assign([], x)
```

## add a timeout to a promise

```javascript
class Timeout {
  constructor() {
    this.ids = []
  }

  set = (delay, reason) =>
    new Promise((resolve, reject) => {
      const id = setTimeout(() => {
        if (reason === undefined) resolve()
        else reject(reason)
        this.clear(id)
      }, delay)
      this.ids.push(id)
    })

  wrap = (promise, delay, reason) =>
    Promise.race([promise, this.set(delay, reason)])

  clear = (...ids) => {
    this.ids = this.ids.filter((id) => {
      if (ids.includes(id)) {
        clearTimeout(id)
        return false
      }
      return true
    })
  }
}

const myFunc = async () => {
  const timeout = new Timeout()
  const timeout2 = new Timeout()
  timeout.set(6000).then(() => console.log('Hello'))
  timeout2.set(4000).then(() => console.log('Hi'))
  timeout
    .wrap(fetch('https://cool.api.io/data.json'), 3000, {
      reason: 'Fetch timeout',
    })
    .then((data) => {
      console.log(data.message)
    })
    .catch((data) => console.log(`Failed with reason: ${data.reason}`))
    .finally(() => timeout.clear(...timeout.ids))
}
// Will either log the `message` or log a 'Fetch timeout' error after 3000ms
// The 6000ms timeout will be cleared before firing, so 'Hello' won't be logged
// The 4000ms timeout will not be cleared, so 'Hi' will be logged
```

## dig

Gets the target value in a nested JSON object, based on the given key.

```javascript
const dig = (obj, target) =>
  target in obj
    ? obj[target]
    : Object.values(obj).reduce((acc, val) => {
        if (acc !== undefined) return acc
        if (typeof val === 'object') return dig(val, target)
      }, undefined)

const data = {
  level1: {
    level2: {
      level3: 'some data',
    },
  },
}

dig(data, 'level3') // 'some data'
dig(data, 'level4') // undefined
```

## debouncePromise

Creates a debounced function that returns a promise, but delays invoking the provided function until at least `ms` milliseconds have elapsed since the last time it was invoked. All promises returned during this time will return the same data.

```javascript
const debouncePromise = (fn, ms = 0) => {
  let timeoutId
  const pending = []
  return (...args) =>
    new Promise((res, rej) => {
      clearTimeout(timeoutId)
      timeoutId = setTimeout(() => {
        const currentPending = [...pending]
        pending.length = 0
        Promise.resolve(fn.apply(this, args)).then(
          (data) => {
            currentPending.forEach(({ resolve }) => resolve(data))
          },
          (error) => {
            currentPending.forEach(({ reject }) => reject(error))
          }
        )
      }, ms)
      pending.push({ resolve: res, reject: rej })
    })
}

const fn = (arg) =>
  new Promise((resolve) => {
    setTimeout(resolve, 1000, ['resolved', arg])
  })
const debounced = debouncePromise(fn, 200)
debounced('foo').then(console.log)
debounced('bar').then(console.log)
// Will log ['resolved', 'bar'] both times
```

## recordAnimationFrames

Invokes the provided callback on each animation frame.

```javascript
const recordAnimationFrames = (callback, autoStart = true) => {
  let running = false,
    raf
  const stop = () => {
    if (!running) return
    running = false
    cancelAnimationFrame(raf)
  }
  const start = () => {
    if (running) return
    running = true
    run()
  }
  const run = () => {
    raf = requestAnimationFrame(() => {
      callback()
      if (running) run()
    })
  }
  if (autoStart) start()
  return { start, stop }
}

const cb = () => console.log('Animation frame fired')
const recorder = recordAnimationFrames(cb)
// logs 'Animation frame fired' on each animation frame
recorder.stop() // stops logging
recorder.start() // starts again
const recorder2 = recordAnimationFrames(cb, false)
// `start` needs to be explicitly called to begin recording frames
```

## counter

Creates a counter with the specified range, step and duration for the specified selector.

```javascript
const counter = (selector, start, end, step = 1, duration = 2000) => {
  let current = start,
    _step = (end - start) * step < 0 ? -step : step,
    timer = setInterval(() => {
      current += _step
      document.querySelector(selector).innerHTML = current
      if (current >= end) document.querySelector(selector).innerHTML = end
      if (current >= end) clearInterval(timer)
    }, Math.abs(Math.floor(duration / (end - start))))
  return timer
}

counter('#my-id', 1, 1000, 5, 2000)
// Creates a 2-second timer for the element with id="my-id"
```

## injectCSS

Injects the given CSS code into the current document

```javascript
const injectCSS = (css) => {
  let el = document.createElement('style')
  el.type = 'text/css'
  el.innerText = css
  document.head.appendChild(el)
  return el
}

injectCSS('body { background-color: #000 }')
// '<style type="text/css">body { background-color: #000 }</style>'
```

## scrollToTop

Smooth-scrolls to the top of the page.

```javascript
const scrollToTop = () => {
  const c = document.documentElement.scrollTop || document.body.scrollTop
  if (c > 0) {
    window.requestAnimationFrame(scrollToTop)
    window.scrollTo(0, c - c / 8)
  }
}
```

## smoothScroll

Smoothly scrolls the element on which it's called into the visible area of the browser window.

```javascript
const smoothScroll = (element) =>
  document.querySelector(element).scrollIntoView({
    behavior: 'smooth',
  })
```

## getVerticalOffset

Finds the distance from a given element to the top of the document.

```javascript
const getVerticalOffset = (el) => {
  let offset = el.offsetTop,
    _el = el
  while (_el.offsetParent) {
    _el = _el.offsetParent
    offset += _el.offsetTop
  }
  return offset
}
```

## elementIsVisibleInViewport

```javascript
const elementIsVisibleInViewport = (el, partiallyVisible = false) => {
  const { top, left, bottom, right } = el.getBoundingClientRect()
  const { innerHeight, innerWidth } = window
  return partiallyVisible
    ? ((top > 0 && top < innerHeight) ||
        (bottom > 0 && bottom < innerHeight)) &&
        ((left > 0 && left < innerWidth) || (right > 0 && right < innerWidth))
    : top >= 0 && left >= 0 && bottom <= innerHeight && right <= innerWidth
}
```

## bottomVisible

Checks if the bottom of the page is visible.

```javascript
const bottomVisible = () =>
  document.documentElement.clientHeight + window.scrollY >=
  (document.documentElement.scrollHeight ||
    document.documentElement.clientHeight)
```

## Open in a new tab

Oftentimes, when linking to an external resource from our websites, we use `target="_blank"` to open the linked page in a new tab or window. But there is a security risk we should be aware of. The new tab gains limited access to the linking page (i.e. our website) via `Window.opener`, which it can then use to alter the linking page's URL via `Window.opener.location` (this is known as tabnabbing).

This might be a problem if the external resource is not trustworthy, might have been hacked, the domain has changed owners over the years etc. There is no guarantee that a third-party resource, no matter how trustworthy, can be actually trusted with our users' security and we, as developers, should always be aware of this risk.

```html
<!-- Bad: susceptible to tabnabbing -->
<a href="https://externalresource.com/some-page" target="_blank">
  External resource
</a>

<!-- Good: new tab cannot cause problems  -->
<a
  href="https://externalresource.com/some-page"
  target="_blank"
  rel="noopener noreferrer"
>
  External resource
</a>
```
