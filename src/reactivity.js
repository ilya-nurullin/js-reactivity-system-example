let currentEffect = null

export function $shallowRef(initValue) {
    const dep = new Dep()
    let value = initValue

    return {
        get value() {
            dep.track()
            return value
        },

        set value(newVal) {
            value = newVal
            dep.trigger()
        }
    }
}

export function $ref(initValue) {
    const dep = new Dep()
    let value = _isPlainObject(initValue) ? $reactive(initValue) : initValue

    return {
        get value() {
            dep.track()
            return value
        },

        set value(newVal) {
            value = newVal
            dep.trigger()
        }
    }
}

function _isPlainObject(val) {
    return Object.prototype.toString.call(val) === '[object Object]'
}

const targetToProps = new WeakMap()

// Map: (target -> props) -> (key -> dep)
function _getDep(target, key) {
    let props = targetToProps.get(target)
    if (!props) {
        props = new Map()
        targetToProps.set(target, props)
    }

    let dep = props.get(key)
    if (!dep) {
        dep = new Dep()
        props.set(key, dep)
    }

    return dep
}

const reactiveObjects = new WeakMap()

export function $reactive(obj) {
    let proxy = reactiveObjects.get(obj)

    if (!proxy) {
        proxy = new Proxy(obj, {
            get(target, key, receiver) {
                const val = Reflect.get(target, key, receiver)

                if (_isPlainObject(val)) {
                    return $reactive(val)
                } else {
                    _getDep(target, key).track()
                    return val
                }
            },
            set(target, key, value, receiver) {
                Reflect.set(target, key, value, receiver)
                _getDep(target, key).trigger()

                return true
            }
        })
        reactiveObjects.set(obj, proxy)
    }

    return proxy
}

export function $computed(computedFn) {
    const dep = new Dep()

    let value = computedFn()

    effect(() => {
        value = computedFn()
        dep.trigger()
    })

    return {
        get value() {
            dep.track()
            return value
        },
    }
}

export function $watch(target, watchFn) {
    effect(() => watchFn(target.value))
}

export const $watchEffect = effect

class Dep {
    #subs = new Set()

    track() {
        if (currentEffect) {
            this.#subs.add(currentEffect)
        }
    }

    trigger() {
        this.#subs.forEach((effect) => effect())
    }
}

export function effect(effectFn) {
    currentEffect = effectFn

    try {
        effectFn()
    } finally {
        currentEffect = null
    }
}