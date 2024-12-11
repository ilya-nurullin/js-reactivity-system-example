import { $computed, $reactive, $ref, $watch, $watchEffect, effect } from "./reactivity.js";

const obj = $ref({
    nested: {
        count: 2
    },
    text : 'init value'
})
const computedCount = $computed(() => obj.value.nested.count * 1000)

// const text = $ref('init value')
const inputComputed = $computed(() => obj.value.text + '!!!')

effect(() => {
    document.getElementById('input').value = obj.value.text
})
effect(() => {
    document.getElementById('inputComputed').textContent = inputComputed.value
})

effect(() => {
    document.getElementById('countComputed').textContent = computedCount.value
})

effect(() => {
    document.getElementById('count').textContent = obj.value.nested.count
})

effect(() => {
    document.getElementById('count2').textContent = obj.value.nested.count
})

document.getElementById('inc').addEventListener('click', (e) => {
    obj.value.nested.count++
    obj.value.text = 'incremented'
})

document.getElementById('dec').addEventListener('click', (e) => {
    obj.value.nested.count--
    obj.value.text = 'decremented'
})

document.getElementById('input').addEventListener('input', (e) => {
    obj.value.text = e.target.value
})

$watchEffect(function (val) {
    console.log(obj.value.nested.count)
})