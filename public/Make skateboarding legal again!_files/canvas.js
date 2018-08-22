///////SETUP////////

const canvas = document.getElementById('canvas');

var sig = document.getElementById('hidden_input');

canvas.style.border = '2px dotted green';

const c = canvas.getContext('2d');

c.strokeStyle = '#383428';

var x;

var y;

var move;

/////////////////////////////

canvas.addEventListener('mousedown', function(e) {
    console.log('mousedown');
    e.stopPropagation();
    x = e.offsetX;
    y = e.offsetY;
    canvas.addEventListener(
        'mousemove',
        (move = function(e) {
            c.moveTo(x, y);
            x = e.offsetX;
            y = e.offsetY;
            c.lineTo(x, y);
            c.stroke();
        })
    );
});

document.addEventListener('mouseup', function() {
    canvas.removeEventListener('mousemove', move);
    sig.value = canvas.toDataURL();
    console.log('sig.val: ', sig.value);
});
