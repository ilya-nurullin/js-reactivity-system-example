import { $computed, $ref, $watch, $watchEffect, Dep, effect } from "./reactivity.js";

let count = $ref(0)
let text = $ref('init')

let computed = $computed(() => text.value + '!!!')

effect(() => {
    document.querySelector('#count').innerHTML = count.value
    document.querySelector('#model').value = text.value
    document.querySelector('#text').innerText = text.value
})

effect(() => {
    document.querySelector('#computed').innerText = computed.value
})


document.querySelector('#inc').addEventListener('click', (e) => {
    count.value++
    text.value = 'incremented'
})

document.querySelector('#dec').addEventListener('click', (e) => {
    count.value--
    text.value = 'decremented'
})

document.querySelector('#model').addEventListener('input', (e) => {
    text.value = e.target.value
})


effect(() => {
    document.querySelector('#computed2').innerHTML = computed.value
})

$watchEffect(() => {
    console.log(computed.value)
})

$watch(count,(val) => {
    console.log(val)
})