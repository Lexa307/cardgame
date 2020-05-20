var socket = io();
let a = null;
document.getElementById("SearhButton").addEventListener('click',findGame,false);
document.getElementById("cancel").addEventListener('click',canselSearch,false);
document.getElementById("exit").addEventListener('click',exitFromSystem,false);

socket.emit("getAccData");

let searvherTimer = null;
  
class Game{

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
        this.requestId = undefined;
        socket.on('closeGame',bind((msg)=>{
          window.cancelAnimationFrame(this.requestId);
          this.renderer.domElement.remove();
          document.getElementById('wrapper').style.display = 'block';
          socket.off('closeGame');
          document.getElementById('serchPanel').innerHTML = `<h1>Поиск игроков...</h1>
          <input type="submit" value="Отмена" id = "cancel" >`;
          removeGame();

        },this))
        this.loadRes();
    }

    onWindowResize () {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();

        this.renderer.setSize( window.innerWidth, window.innerHeight );

    }

    animate () {
        this.requestId = requestAnimationFrame( this.animate.bind(this) );
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
      // this.bgImage = document.body.style.backgroundImage;
      // document.body.style.backgroundImage = "none";
      document.getElementById('accInfo').style.display = "none";
      document.getElementById('wrapper').style.display = 'none';
      document.getElementById('serchPanel').style.display = 'none';
        this.mouse = new THREE.Vector2(0,0);
        this.raycaster = new THREE.Raycaster();
        var ambientLight = new THREE.AmbientLight( 0xFFFFFF,0.9 ); 
        this.scene.add( ambientLight );
        this.light = new THREE.PointLight();
        this.scene.add(this.light);
        var loader = new THREE.GLTFLoader().setPath( 'models/' );
            loader.load( 'field/field.glb', bind( function ( gltf ) {
                this.scene.add( gltf.scene );
                this.fscene = gltf.scene;
                this.camera.position.set(23,55,26);
                this.light.position.set(10,70,26);
                loader.load('card/card_models.glb',bind(function(gltf){
                  this.colodCard = gltf.scene.children[0];
                  this.fieldCard = gltf.scene.children[1];
                  this.controls = new THREE.OrbitControls( this.camera, this.renderer.domElement );
                  this.controls.target = new THREE.Vector3(-10,  20,  26);
                  this.controls.update();  
                  this.animate();  
                },this))
                
            },this)
            );
      }
}

function findGame () {
  socket.emit('searching', 'username');
  document.getElementById('wrapper').style.display = 'none';
  document.getElementById('serchPanel').style.display = 'block';
}

function canselSearch(){
  socket.emit('cancelSearch');
  document.getElementById('wrapper').style.display = 'block';
  document.getElementById('serchPanel').style.display = 'none';
}
socket.on("cardResLoad",(msg)=>{
  console.log(msg);
  setTimeout(()=>{a = new Game();},5000)
  

})
socket.on("gameFounded",(msg)=>{
  document.getElementById('serchPanel').innerHTML = `<h1>Игра найдена!</h1> <br> Запуск матча...`
})
socket.on("accData",(msg)=>{
  document.getElementById('accInfo').innerText = 
`${msg.nickname}
боев:${msg.battles}
побед:${msg.win}
ранг:${msg.rank}
золота:${msg.gold}`
})

function exitFromSystem(){
  var xhr = new XMLHttpRequest();
  var body = ''
  xhr.open("POST", '/exit', true);
  xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
  xhr.send(body);
  console.log(xhr);
}

function bind(func, context) {
	return function() {
	  return func.apply(context, arguments);
	};
}
function removeGame(){
  delete a;
  document.getElementById('accInfo').style.display = "block";
}
