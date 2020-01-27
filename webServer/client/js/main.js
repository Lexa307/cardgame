
function bind(func, context) {
  return function() {
    return func.apply(context, arguments);
  };
}
let a;//slider obj
let socket = io();
const nick = document.getElementById("name");
const connect_btn = document.getElementById("connect_btn");
connect_btn.addEventListener("click",()=>{
  
  socket.emit("join",nick.value)
  console.log(nick.value);



},false);

socket.on('respond', function(msg){
  if(msg.msg=="ok"){
    if ( THREE.WEBGL.isWebGLAvailable() ) {
      document.getElementById("form").parentNode.removeChild(document.getElementById("form"));//delete form
      a = new Slider(msg.data);
    } else {
      socket.emit("disconnect","")
     var warning = THREE.WEBGL.getWebGLErrorMessage();
     document.body.appendChild( warning );
   
   }
   
   

  }else{
    alert(msg);
  }
 
});




class Slider{
  constructor(state){

    this.scene = new THREE.Scene();
    this.renderer =  new THREE.WebGLRenderer({antialias:true})
    this.camera = new THREE.PerspectiveCamera( 60, window.innerWidth / window.innerHeight, 0.1, 60000 );
    this.renderer.setPixelRatio( window.devicePixelRatio );
    this.renderer.setSize( window.innerWidth, window.innerHeight );
    this.initRotation = state;
    this.scene.background = new THREE.Color(0x161616);
    this.loadRes();
   
    

   
    
  }

  onWindowResize () {
	  console.log(window.devicePixelRatio);
    // this.container.width = window.innerWidth;
    // this.container.height = window.innerHeight;
    this.renderer.setPixelRatio( window.devicePixelRatio );
    this.renderer.setSize( window.innerWidth, window.innerHeight );
    
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
  }
  
  


  animate () {
    
	  requestAnimationFrame( this.animate.bind(this) );
     this.stats.begin();
     
    
    // this.controls.target.set(this.focusPoint.x,this.focusPoint.y,this.focusPoint.z)
      
      this.light2.position.set( this.camera.position.x,this.camera.position.y,this.camera.position.z);
      this.renderer.render( this.scene, this.camera );
     this.stats.end();

  }
  loadRes(){
    
    let loader = new THREE.TextureLoader();

    // load a resource
    loader.load(
      // resource URL
      'textures/test.jpg',
    
      // onLoad callback
      bind(function ( texture ) {
        // in this example we create the material when the texture is loaded
        let geometry = new THREE.PlaneGeometry( 10, 20, 1,1 );
        let material = new THREE.MeshBasicMaterial( {map: texture, side: THREE.DoubleSide} );
        this.plane = new THREE.Mesh( geometry, material );
        this.plane.name = 'card';
        this.plane.rotation.set(this.initRotation.x,this.initRotation.y,this.initRotation.z)
        
        this.Init();
      },this),
    
      // onProgress callback currently not supported
      undefined,
    
      // onError callback
      function ( err ) {
        console.error( 'An error happened.' );
      }
    );
  }
  
    



  Init(){

    
    
    this.camera.position.set( 0,  20, 20);
    
    this.scene.add(this.plane);
    this.mouse = new THREE.Vector2(0,0);
    this.renderer.setSize( window.innerWidth, window.innerHeight );
    this.raycaster = new THREE.Raycaster();
    this.container;
    this.camera.lookAt(this.plane.position);

    this.container = document.createElement( 'div' );
    document.body.appendChild( this.container );//  размещение контейнера в body
    this.container.appendChild( this.renderer.domElement );// помещение рендерера в контейнер

   
    let ambientLight = new THREE.AmbientLight(0x404040,2); 
    ambientLight.visible=true;
    //this.scene.add(ambientLight);
    
    
    this.light = new THREE.PointLight(0x404040, 2,1000);
    this.light.position.set( 20,  116,  116);
    this.scene.add(this.light);

    this.light2 = new THREE.PointLight(0xC4C4C4, 1,1000);
    this.light2.position.set( -91, 39.9, 34.9);
    this.scene.add(this.light2);
    // this.controls = new THREE.OrbitControls( this.camera, this.renderer.domElement );
    // this.controls.target = new THREE.Vector3(0.3563309574910036, 26.199806330960396, 10.148635574650198);
    this.stats = new Stats();
    document.body.appendChild( this.stats.dom );
    
    window.addEventListener("resize",bind(this.onWindowResize,this), false);
    this.container.addEventListener('click',bind(this.onClick,this));
   
   
    
    this.animate();
    
    
    
    
  }
  onClick(event){
    this.mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
    this.mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;
    this.raycaster.setFromCamera( this.mouse, this.camera );
    let intersects = this.raycaster.intersectObjects( this.scene.children );

	  if(intersects.length>0){
      if(intersects[ 0 ].object.name == 'card'){
        socket.emit('cardClick', 1);

      }
    }

		

	  
  }


  

  
  
  


    
 
  
  
  
  

  
  
}

socket.on('rotate', function(msg){
  TweenMax.to(a.plane.rotation,1,{y:a.plane.rotation.y+msg,ease: Power2.easeInOut});
 
});

