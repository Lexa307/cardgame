var socket = io();
let a = null;
document.getElementById("SearhButton").addEventListener('click',findGame,false);
document.getElementById("cancel").addEventListener('click',canselSearch,false);
document.getElementById("exit").addEventListener('click',exitFromSystem,false);

socket.emit("getAccData");

let searvherTimer = null;
  
class Game{

    constructor(cards,selector){
        
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
        this.cards = cards;
        this.ourColodCardS = [];
        this.enemyColodCards = [];
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
        this.firstCards = [];
        socket.on('ChooseCard',bind(()=>{
          console.log("chosing begining");
          this.repickStartCards();
        },this));
        this.loadRes();
    }

    onWindowResize () {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();

        this.renderer.setSize( window.innerWidth, window.innerHeight );

    }

    animate () {
        this.camera.lookAt(this.focus);
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
      TweenMax.to(this.focus,0.5,{x:-10+this.mouse.y*2,z:26+this.mouse.x*0.5,ease: Power2.easeOut})
    }

    repickStartCards(){
      let chCards = [...this.ourColodCardS];
      
      if(this.firstCards.length > 0){
        for(let i = 0; i < this.firstCards.length; i++){
          this.groupOf3Cards.remove(this.firstCards[i]);
        }
      }else{
        this.groupOf3Cards.add(new THREE.Mesh(
          new THREE.PlaneBufferGeometry(500,500,1,1),
          new THREE.MeshBasicMaterial({color:0x000000,transparent:true,opacity:0.8})
          )
        );
        this.groupOf3Cards.children[0].rotation.y = (Math.PI/2) ;
        this.groupOf3Cards.children[0].position.y = -1;
        let textGeometry = new THREE.TextBufferGeometry( "Выберите стартовую колоду", 
          {
              font: this.font,
              size: 0.5,
              height: 0,
              curveSegments: 12,
              bevelEnabled: false,
          } 
      );
      textGeometry.computeBoundingBox(); 
      textGeometry.translate( - 0.5 * ( textGeometry.boundingBox.max.x - textGeometry.boundingBox.min.x), 0, 0 );
      this.groupOf3Cards.add(new THREE.Mesh(textGeometry, new THREE.MeshBasicMaterial({color:0xFFFFFF})));
      this.groupOf3Cards.children[1].rotation.y = Math.PI/2;
      this.groupOf3Cards.children[1].position.y = 2;
      this.groupOf3Cards.children[1].position.z = 3;

      // let selectGeometry = new THREE.TextBufferGeometry( "Готово", 
      // {
      //     font: this.font,
      //     size: 0.5,
      //     height: 0,
      //     curveSegments: 12,
      //     bevelEnabled: false,
      // } 
      // );
      // selectGeometry.computeBoundingBox(); 
      // selectGeometry.translate( - 0.5 * ( selectGeometry.boundingBox.max.x - selectGeometry.boundingBox.min.x), 0, 0 );
      // this.groupOf3Cards.add(new THREE.Mesh(selectGeometry, new THREE.MeshBasicMaterial({color:0xFFFFFF})));
      // this.groupOf3Cards.children[2].rotation.y = Math.PI/2;
      // this.groupOf3Cards.children[2].position.y = 0;
      // this.groupOf3Cards.children[2].position.z = -1;
      // this.groupOf3Cards.children[2].position.x = 4;

      }

      this.firstCards = [];
      for(let i = 0; i < 3; i++){
        let tmpObject = chCards.splice(THREE.Math.randInt(0,chCards.length - 1),1)[0];
        this.firstCards.push(tmpObject);
        this.groupOf3Cards.add(this.firstCards[i]);
        this.firstCards[i].position.set(1,0,(i*2.5));
        this.groupOf3Cards.position.set(0,0,-10);
        this.camera.attach(this.groupOf3Cards);
        this.firstCards[i].rotation.y = Math.PI/2;
        this.groupOf3Cards.position.x = 2.6;
      }
    }
    generateText(card){
      if(card.info){
        let textMaterial = new THREE.MeshBasicMaterial({color:0x000000});
        let tittleText = card.info.card_name;
        let tittle = new THREE.TextBufferGeometry("")
      }else{
        return;
      }
    }

   
    loadRes(){
      // this.bgImage = document.body.style.backgroundImage;
      // document.body.style.backgroundImage = "none";
      document.getElementById('accInfo').style.display = "none";
      document.getElementById('wrapper').style.display = 'none';
      document.getElementById('serchPanel').style.display = 'none';
        this.focus = new THREE.Vector3(-10,  20,  26);
        this.groupOf3Cards = new THREE.Group();
        this.scene.add(this.camera);
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
                  console.log(this.colodCard);
                  new THREE.TextureLoader().load("textures/card/card_default.jpg",bind((textureD)=>{
                    console.log("default loaded");
                    textureD.flipY = false;
                    this.colodCard.material.map = textureD;
                    new THREE.FontLoader().load( 'fonts/Montserrat Medium_Regular.json', bind(function ( font ){
                      this.font = font;
                    },this))
                  },this))
                  let loadCounter = this.cards[0].length;
                  for(let i = 0; i < this.cards[0].length; i++ ){
                    new THREE.TextureLoader().load(`${this.cards[0][i]["res_path"]}/hero_default.jpg`,bind((texture)=>{
                      texture.center = new THREE.Vector2(0.5,0.5);
                      texture.rotation = 1;
                      this.ourColodCardS.push(this.colodCard.clone())
                      this.ourColodCardS[this.ourColodCardS.length-1].children[0].material = new THREE.MeshLambertMaterial({map:texture});
                      this.ourColodCardS[this.ourColodCardS.length-1].info = this.cards[0];
                      loadCounter--;
                    },this));  
                  }
                  let awaitLoadingTimer = setInterval(()=>{
                    if(loadCounter == 0){
                      socket.emit("loadingReady");
                      clearInterval(awaitLoadingTimer);
                    }
                  },100)
                  // this.controls = new THREE.OrbitControls( this.camera, this.renderer.domElement );
                  // this.controls.target = new THREE.Vector3(-10,  20,  26);
                  // this.controls.update();  
                  document.addEventListener( 'mousemove', bind(this.onMouseMove,this), false );
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
  setTimeout(()=>{a = new Game(msg);},5000)
  

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
  xhr.onreadystatechange = ()=>{
    console.log(xhr);
    window.location.reload();
  }
  xhr.send(body);
  
  
}

function bind(func, context) {
	return function() {
	  return func.apply(context, arguments);
	};
}
function removeGame(){
  delete a;
  document.getElementById('accInfo').style.display = "block";
  socket.emit("getAccData");
}
