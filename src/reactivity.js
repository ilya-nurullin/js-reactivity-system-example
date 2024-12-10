let currentEffect = null

export class Dep {
    #deps = new Set()

    track() {
        if (currentEffect) {
            this.#deps.add(currentEffect)
        }
    }

    trigger() {
        this.#deps.forEach(dep => dep())
    }
}

export function effect(effectFunction) {
    currentEffect = effectFunction
    try {
        effectFunction()
    } finally {
        currentEffect = null
    }
}


export function $shallowRef(initVal) {
    const dep = new Dep()
    let value = initVal
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

export function $ref(initVal) {
    const dep = new Dep()

    let value = _isObject(initVal) ? $reactive(initVal) : initVal

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

const targetToProps = new WeakMap()

// Map: target -> key -> Dep
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

function _isObject(obj) {
    return Object.prototype.toString.call(obj) === '[object Object]'
}

export function $reactive(obj) {
    return new Proxy(obj, {
        get(target, key, receiver) {
            _getDep(target, key).track()
            const val = Reflect.get(target, key, receiver)
            return _isObject(val) ? $reactive(val) : val
        },
        set(target, key, value, receiver) {
            Reflect.set(target, key, value, receiver)
            _getDep(target, key).trigger()
            return true
        },
    })
}

export function $computed(computedFunction) {
    const dep = new Dep()
    let value = null

    effect(() => {
        value = computedFunction();
        dep.trigger()
    })

    return {
        get value() {
            dep.track()
            return value
        }
    }
}

export function $watch(target, watchFn) {
    effect(()=> {
        watchFn(target.value)
    })
}

export const $watchEffect = effect

