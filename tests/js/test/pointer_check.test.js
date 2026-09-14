test('PointerEvent availability in jsdom', () => {
    console.log('PointerEvent type:', typeof PointerEvent);
    if (typeof PointerEvent === 'function') {
        const e = new PointerEvent('pointerdown', {clientX: 70});
        console.log('clientX:', e.clientX);
    }
});
