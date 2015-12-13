// Set up the scene, camera, and renderer as global variables.
var scene, camera, renderer;
var keyboard_keys = [];
var keys_down = [];
var clock = new THREE.Clock();
var int;
var sounds = {
    90 :  'c', // C 0
    83 :  'c', // C#0
    88 :  'd', // D 0
    68 :  'd', // D#0
    67 :  'e', // E 0
    86 :  'f', // F 0
    71 :  'f', // F#0
    66 :  'g', // G 0
    72 :  'g', // G#0
    78 :  'a', // A 0
    74 :  'a', // A#0
    77 :  'b', // B 0
    188 : 'c', // C 0
    //-----------------------------------
    81 :  'c', // C 1
    50 :  'c', // C#1
    87 :  'd', // D 1
    51 :  'd', // D#1
    69 :  'e', // E 1
    82 :  'f', // F 1
    53 :  'f', // F#1
    84 :  'g', // G 1
    54 :  'g', // G#1
    89 :  'a', // A 1
    55 :  'a', // A#1
    85 :  'b', // B 1
    //-----------------------------------
    73 :  'c', // C 2
    57 :  'c', // C#2
    79 :  'd', // D 2
    48 :  'd', // D#2
    80 :  'e', // E 2
    219 :  'f', // F 2
    187 :  'f', // F#2
    221 :  'g', // G 2
};

init();
animate();

//*******************************************************

var keyState = Object.freeze ({unpressed: {}, note_on: {}, pressed:{}, note_off:{} });


var material = new THREE.MeshLambertMaterial( { color: 0x606060} )

noteOnColor = new THREE.Color().setRGB(255, 0, 0);


// Sets up the scene.
function init() {

// Create the scene and set the scene size.
scene = new THREE.Scene();
var WIDTH = window.innerWidth,
HEIGHT = window.innerHeight;

// Create a renderer and add it to the DOM.
renderer = new THREE.WebGLRenderer({antialias:true});
renderer.setSize(WIDTH, HEIGHT);
document.body.appendChild(renderer.domElement);

// Create a camera, zoom it out from the model a bit, and add it to the scene.
camera = new THREE.PerspectiveCamera(30, WIDTH / HEIGHT, 0.5, 20000);
camera.position.set(100,550,1500); //-350, 350, 800
scene.add(camera);

//addinga scene to the whole of the project
var w = 10000, h = 5000;
var floorTex = THREE.ImageUtils.loadTexture("images/grass.jpg");
floorTex.wrapS = floorTex.wrapT = THREE.RepeatWrapping;
floorTex.repeat.set(4, 2);

var floorMat = new THREE.MeshPhongMaterial({
                                           specular: 0x0000ff,
                                           shininess: 0,
                                           map: floorTex,
                                           bumpMap: floorTex,
                                           bumpScale: 5.0
});
var floorGeo = new THREE.PlaneGeometry(w, h);
var floor = new THREE.Mesh(floorGeo, floorMat);
floor.rotation.x = - 90 * ( Math.PI / 180 );
floor.position.y = -50.0;
scene.add(floor);


//*******
//loadSoundObj({ src : 'credo.mp3' });

// Create an event listener that resizes the renderer with the browser window.
window.addEventListener('resize', function() {
                        var WIDTH = window.innerWidth,
                        HEIGHT = window.innerHeight;
                        renderer.setSize(WIDTH, HEIGHT);
                        camera.aspect = WIDTH / HEIGHT;
                        camera.updateProjectionMatrix();
});

//Background

var vertexShader = document.getElementById( 'vertexShader' ).textContent;
var fragmentShader = document.getElementById( 'fragmentShader' ).textContent;



// Create a light, set its position, and add it to the scene.
var light = new THREE.PointLight(0xfffff3, 0.8);
light.position.set(-100,1200,100);
scene.add(light);

var sphereSize = 1;
var pointLightHelper = new THREE.PointLightHelper( light, sphereSize );
scene.add( pointLightHelper );


var light2 = new THREE.PointLight(0xd7f0ff, 0.2);
light2.position.set(200,1200,100);
scene.add(light2);

var sphereSize = 1;
var pointLightHelper2 = new THREE.PointLightHelper( light2, sphereSize );
scene.add( pointLightHelper2 );


var light3 = new THREE.PointLight(0xFFFFFF, 0.5);
light3.position.set(150,1200,-100);
scene.add(light3);

var sphereSize = 1;
var pointLightHelper3 = new THREE.PointLightHelper( light3, sphereSize );
scene.add( pointLightHelper3 );

var ambient = new THREE.AmbientLight(0x444444);
scene.add(ambient);
var sun = new THREE.DirectionalLight(0xffffff, 0.6);
sun.position.set(1.0, 1.0, 2.0);
scene.add(sun);

var loader = new THREE.ColladaLoader();
loader.options.convertUpAxis = true;
loader.load( 'obj/piano.dae', function ( collada ) {

//adding the piano to the scene from a .dae file
var dae = collada.scene;
var skin = collada.skins[ 0 ];

dae.position.set(-1000,0,0);//x,z,y: position for the piano
dae.scale.set(1.5,1.5,1.5);

dae.traverse(initialize_keys);
scene.add(dae);


});

// Add OrbitControls so that we can pan around with the mouse.
controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.key_attack = 0.3; //9
    controls.key_max_rot = 1.55; //1.5 best
    controls.octave = 2;

}


////  ADDED HERE **************///


function initialize_keys( obj)
{
    keyboard_keys.push(obj);
    obj.rotation.y = 0;
    obj.rotation.z = 0;
    obj.keyState = keyState.unpressed;
    obj.clock = new THREE.Clock(false);
    obj.castShadow = true;
    obj.receiveShadow = true;
    // only add meshes in the material redefinition (to make keys change their color when pressed)
    if (obj instanceof THREE.Mesh)
    {
        old_material = obj.material;
        obj.material = new THREE.MeshPhongMaterial( { color:old_material.color} );
        obj.material.shininess = 35.0;
        obj.material.specular = new THREE.Color().setRGB(0.25, 0.25, 0.25);;
        obj.material.note_off = obj.material.color.clone();
        
    }
}

function key_status (keyName, status)
{
    console.log("KeyName: ");
    console.log(keyName);
    
    var obj = scene.getObjectByName(keyName, true);
    if (obj != undefined)
    {
        obj.clock.start();
        obj.clock.elapsedTime = 0;
        obj.keyState = status;
    }
}

function smoothstep(a,b,x)
{
    if( x<a ) return 0.0;
    if( x>b ) return 1.0;
    var y = (x-a)/(b-a);
    return y*y*(3.0-2.0*y);
}
function mix(a,b,x)
{
    return a + (b - a)*Math.min(Math.max(x,0.0),1.0);
}

function update_key( obj, delta )
{
    baseX = obj.rotation.x;
    if (obj.keyState == keyState.note_on)
    {
        obj.rotation.x = mix(-Math.PI/4.0, -controls.key_max_rot, smoothstep(0.0, 1.0, controls.key_attack*obj.clock.getElapsedTime()));
        if ((obj.rotation.x) >= -controls.key_max_rot)
        {
            obj.keyState = keyState.pressed;
            obj.clock.elapsedTime = 0;
        }
    }
    else if (obj.keyState == keyState.note_off)
    {
        obj.rotation.x = mix(-controls.key_max_rot, -Math.PI/4.0, smoothstep(0.0, 1.0, controls.key_attack*obj.clock.getElapsedTime()));
        if ((obj.rotation.x) <= -Math.PI/4.0)
        {
            obj.keyState = keyState.unpressed;
            obj.clock.elapsedTime = 0;
        }
    }
}

function update( delta )
{
    for(i in keyboard_keys)
    {
        update_key(keyboard_keys[i], delta);
    }
}

function keyCode_to_note( keyCode)
{
    console.log("Note: ", keyCode);
    var note = -1;
    //-----------------------------------
    if(   keyCode==90 )  note= 0; // C 0
    if(   keyCode==83 )  note= 1; // C#0
    if(   keyCode==88 )  note= 2; // D 0
    if(   keyCode==68 )  note= 3; // D#0
    if(   keyCode==67 )  note= 4; // E 0
    if(   keyCode==86 )  note= 5; // F 0
    if(   keyCode==71 )  note= 6; // F#0
    if(   keyCode==66 )  note= 7; // G 0
    if(   keyCode==72 )  note= 8; // G#0
    if(   keyCode==78 )  note= 9; // A 0
    if(   keyCode==74 )  note=10; // A#0
    if(   keyCode==77 )  note=11; // B 0
    if(   keyCode==188 ) note=12; // C 0
    //-----------------------------------
    if(   keyCode==81 )  note=12; // C 1
    if(   keyCode==50 )  note=13; // C#1
    if(   keyCode==87 )  note=14; // D 1
    if(   keyCode==51 )  note=15; // D#1
    if(   keyCode==69 )  note=16; // E 1
    if(   keyCode==82 )  note=17; // F 1
    if(   keyCode==53 )  note=18; // F#1
    if(   keyCode==84 )  note=19; // G 1
    if(   keyCode==54 )  note=20; // G#1
    if(   keyCode==89 )  note=21; // A 1
    if(   keyCode==55 )  note=22; // A#1
    if(   keyCode==85 )  note=23; // B 1
    //-----------------------------------
    if(   keyCode==73 )  note=24; // C 2
    if(   keyCode==57 )  note=25; // C#2
    if(   keyCode==79 )  note=26; // D 2
    if(   keyCode==48 )  note=27; // D#2
    if(   keyCode==80 )  note=28; // E 2
    if(   keyCode==219 ) note=29; // F 2
    if(   keyCode==187 ) note=30; // F#2
    if(   keyCode==221 ) note=31; // G 2
    //-----------------------------------
    if( note == -1 ) return -1;
    
    return ("_" + (note + controls.octave*12));
}

window.onkeydown = function(ev)
{
    if (keys_down[ev.keyCode] != true)
    {
        var note = keyCode_to_note(ev.keyCode);
        if (note != -1)
        {
            key_status(note, keyState.note_on);
            keys_down[ev.keyCode] = true;
            var delay = 0; // play one note every quarter second
            var note = parseInt(note.substr(1))+21; // the note
            //checks the returned note and gives a sound
            var soundId = sounds[ev.keyCode];
            /*
            switch(soundId) {
                case 'a':
                    playa();
                    console.log("a");
                    break;
                case 'b':
                    playa();
                    console.log("b");
                    break;
                case 'c':
                    playa();
                                        console.log("c");
                    break;
                case 'd':
                    playa();
                                        console.log("d");
                    break;
                case 'e':
                    playa();
                                        console.log("e");
                    break;
                case 'f':
                    playa();
                                        console.log("f");
                    break;
                case 'g':
                    playa();
                                        console.log("g");
                    break;
                default:
                    console.log("Invalid case");
            }
             */
        }
    }
}

window.onkeyup = function(ev)
{
    if (keys_down[ev.keyCode] == true)
    {
        var note = keyCode_to_note(ev.keyCode);
        key_status(note, keyState.note_off);
        keys_down[ev.keyCode] = false;
        var delay = 0; // play one note every quarter second
        var note = parseInt(note.substr(1))+21;
    }
}


//************************************************************************



// Renders the scene and updates the render as needed.
function animate() {

requestAnimationFrame(animate);
    var delta = clock.getDelta();
    
    update(delta);

// Render the scene.
renderer.render(scene, camera);
controls.update();

}

//******************Sound playing functios****************************//
/*

function playc(){
    myAudio.currentTime = 0;
    myAudio.play();
    int = setInterval(function() {
                      if (myAudio.currentTime > 1) {
                      myAudio.pause();
                      clearInterval(int);
                      }
                      }, 10);
}

function playd(){
    clearInterval(int);
    myAudio.currentTime = 2;
    myAudio.play();
    
    int = setInterval(function() {
                      if (myAudio.currentTime > 3) {
                      myAudio.pause();
                      clearInterval(int);
                      }
                      }, 10);
}

function playe(){
    clearInterval(int);
    myAudio.currentTime = 4;
    myAudio.play();
    int = setInterval(function() {
                      if (myAudio.currentTime > 5) {
                      myAudio.pause();
                      clearInterval(int);
                      }
                      }, 10);
}

function playf(){
    clearInterval(int);
    myAudio.currentTime = 6;
    myAudio.play();
    int = setInterval(function() {
                      if (myAudio.currentTime > 7) {
                      myAudio.pause();
                      clearInterval(int);
                      }
                      }, 10);
}

function playg(){
    clearInterval(int);
    myAudio.currentTime = 8;
    myAudio.play();
    int = setInterval(function() {
                      if (myAudio.currentTime > 9) {
                      myAudio.pause();
                      clearInterval(int);
                      }
                      }, 10);
}

function playa(){
    clearInterval(int);
    myAudio.currentTime = 10;
    myAudio.play();
    int = setInterval(function() {
                      if (myAudio.currentTime > 11) {
                      myAudio.pause();
                      clearInterval(int);
                      }
                      }, 10);
}

function playb(){
    clearInterval(int);
    myAudio.currentTime = 12;
    myAudio.play();
}
 */
