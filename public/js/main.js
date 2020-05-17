var socket = io();
let a = null;
let Sbtn = document.getElementById("SearhButton");
Sbtn.addEventListener('click',findGame,false);
function findGame () {
socket.emit('searching', 'username');
}
socket.on("cardResLoad",(msg)=>{
  console.log(msg);
  a = new Slider();

})
socket.on("gameFounded",(msg)=>{
  console.log("founded Game");
})

function bind(func, context) {
	return function() {
	  return func.apply(context, arguments);
	};
}
  
class Slider{

    constructor(selector){
        
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x3F3683);
        if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|BB|PlayBook|IEMobile|Windows Phone|Kindle|Silk|Opera Mini/i.test(navigator.userAgent)) {
        this.renderer = selector ? (()=>{ return new THREE.WebGLRenderer( { canvas: selector, context: selector.getContext( 'webgl', { alpha: false,antialias:false } ) } );})()  : new THREE.WebGLRenderer()
        this.camera = new THREE.PerspectiveCamera( 75, (window.innerWidth) / (window.innerWidth/1.77), 0.1, 60000 );
        this.mobile = true;
        }else{
        this.mobile = false;
        this.renderer = selector ? (()=>{ return new THREE.WebGLRenderer( { canvas: selector, context: selector.getContext( 'webgl', { alpha: true,antialias:true } ) } );})()  : new THREE.WebGLRenderer({alpha: true,antialias:true})
        this.camera = new THREE.PerspectiveCamera( 54, window.innerWidth / (window.innerHeight), 0.1, 60000 );
        }
        this.renderer.setPixelRatio( window.devicePixelRatio );
        this.renderer.setSize( window.innerWidth, (window.innerHeight) );//(window.innerWidth/1.77)
        document.body.appendChild( this.renderer.domElement );
        
        this.loadRes();
    }

    onWindowResize () {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();

        this.renderer.setSize( window.innerWidth, window.innerHeight );

    }

    animate () {
        requestAnimationFrame( this.animate.bind(this) );
        this.renderer.render( this.scene, this.camera );
        this.raycaster.setFromCamera( this.mouse, this.camera );
        var intersects = this.raycaster.intersectObjects( this.scene.children );

        
    }


    mouseHandle(event){
      
    }
    onMouseMove ( event ) {
      this.mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
      this.mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;
    }
   
    loadRes(){
      document.body.style.backgroundImage = "none";
      document.getElementById('wrapper').style.display = 'none';
        this.mouse = new THREE.Vector2(0,0);
        this.raycaster = new THREE.Raycaster();
        var light = new THREE.AmbientLight( 0xFFFFFF,0.9 ); 
        this.scene.add( light );
        var loader = new THREE.GLTFLoader().setPath( 'res/' );
            loader.load( 'field/field.glb', bind( function ( gltf ) {
                this.scene.add( gltf.scene );
                this.fscene = gltf.scene;
                this.camera.position.set(10,88,26);
                loader.load('card/colod_card_def.glb',bind(function(gltf){
                  this.colodCard = gltf.scene.children[0];
                  loader.load('card/field_card_def.glb',bind(function(gltf){
                    this.fieldCard = gltf.scene.children[0];
                    this.controls = new THREE.OrbitControls( this.camera, this.renderer.domElement );
                    this.controls.target = new THREE.Vector3(-10,  20,  26);
                    this.controls.update();  
                    this.animate();  
                  },this))
                },this))
                
            },this)
            );
      }
}
