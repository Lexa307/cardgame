import * as THREE from '../lib/three.module.js';
import { GLTFLoader } from '../lib/GLTFLoader.js';
import SocketClientWorker from './socket.js';

function bind(func, context) {
	return function() {
	  return func.apply(context, arguments);
	};
}

export default class Game{
    constructor(cards,reference){
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x3F3683);
        this.mobile = false;
        if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|BB|PlayBook|IEMobile|Windows Phone|Kindle|Silk|Opera Mini/i.test(navigator.userAgent)) this.mobile = true;
        this.renderer = new THREE.WebGLRenderer({alpha: !this.mobile, antialias:!this.mobile});
        this.camera = new THREE.PerspectiveCamera( 54, (window.innerWidth/1.77) / (window.innerHeight/1.77), 0.1, 60000 );
        this.cards = cards;
        this.ourColodCardS = [];
        this.enemyColodCards = [];
        this.renderer.setPixelRatio( window.devicePixelRatio );
        this.renderer.setSize( window.innerWidth, window.innerHeight );//(window.innerWidth/1.77)
        this.renderer.domElement.style.width = "100%";
        this.renderer.domElement.style.height = "100%";
        document.body.appendChild( this.renderer.domElement );
        this.requestId = undefined;
        SocketClientWorker.socket.on('closeGame',bind((msg)=>{
          window.cancelAnimationFrame(this.requestId);
          this.renderer.domElement.remove();
          document.getElementById('wrapper').style.display = 'block';
          SocketClientWorker.socket.off('closeGame');
          this.removeGame(reference);
        },this))
        SocketClientWorker.socket.on('updateGold',bind((msg)=>{
          this.updateGold(msg);
        },this));
        SocketClientWorker.socket.on('round',bind((msg)=>{
          this.updateRound(msg);
        },this))
        SocketClientWorker.socket.on('sendEnemy',bind((msg)=>{
          this.enemyName = msg;
          let EnemyNickGeometry = new THREE.TextBufferGeometry( this.enemyName, 
            {
                font: this.font,
                size: 2,
                height: 1,
                curveSegments: 12,
                bevelEnabled: false,
            }
            );
            EnemyNickGeometry.computeBoundingBox(); 
            EnemyNickGeometry.translate( - 0.5 * ( EnemyNickGeometry.boundingBox.max.x - EnemyNickGeometry.boundingBox.min.x), 0, 0 );
            this.EnemyNickMesh = new THREE.Mesh(EnemyNickGeometry, new THREE.MeshBasicMaterial({color:0xFF0000}));
            this.scene.add(this.EnemyNickMesh);
            this.EnemyNickMesh.position.set(-30,  30,  10);
            this.EnemyNickMesh.lookAt(this.camera.position);
        },this))
        this.firstCards = [];
        SocketClientWorker.socket.on('ChooseCard',bind(()=>{
          console.log("chosing begining");
          this.repickStartCards();
        },this));
        this.loadRes();
    }

    onWindowResize () {
        this.camera.aspect = (window.innerWidth/1.77) / (window.innerHeight/1.77);
        this.camera.updateProjectionMatrix();
        this.renderer.setSize( window.innerWidth, window.innerHeight );
    }

    removeGame(ref){
      ref = null;
      document.getElementById('accInfo').style.display = "block";
      SocketClientWorker.socket.emit("getAccData");
    }

    animate () {
        this.camera.lookAt(this.focus);
        this.requestId = requestAnimationFrame( this.animate.bind(this) );
        this.renderer.render( this.scene, this.camera );
        this.raycaster.setFromCamera( this.mouse, this.camera );
        var intersects = this.raycaster.intersectObjects( this.scene.children );     
    }

    updateRound(state){
      if(this.RoundTurnMeshText) this.scene.remove(this.RoundTurnMeshText);
      if(this.roundLine) this.scene.remove(this.roundLine);
      let RoundInfo = {RoundTurnMessage:"Ход противника",MessageColor:0xff0000};
      if(state == 1) RoundInfo = {RoundTurnMessage:"Ваш ход",MessageColor:new THREE0xffffff};
      this.endRoundButton.visible = !state;
      let RoundGeometryText = new THREE.TextBufferGeometry( RoundInfo.RoundTurnMessage, 
          {
              font: this.font,
              size: 2,
              height: 0,
              curveSegments: 12,
              bevelEnabled: false,
          });
      this.endRoundButton.visible = true; 
      this.roundLine = new THREE.Mesh(new THREE.BoxBufferGeometry(0.5,0.5,50),new THREE.MeshBasicMaterial(RoundInfo.MessageColor));
      this.scene.add(this.roundLine);
      this.roundLine.position.set(-15,  20,  26);
      
      TweenMax.to(this.roundLine.scale,60,{z:0.001,onComplete:()=>{

      }});
      RoundGeometryText.computeBoundingBox(); 
      RoundGeometryText.translate( - 0.5 * ( RoundGeometryText.boundingBox.max.x - RoundGeometryText.boundingBox.min.x), 0, 0 );
      this.RoundTurnMeshText = new THREE.Mesh(RoundGeometryText,new THREE.MeshBasicMaterial({color:RoundInfo.MessageColor,transparent:true,opacity:1}));
      this.scene.add(this.RoundTurnMeshText);
      this.RoundTurnMeshText.position.set(-10,  20,  26);
      this.RoundTurnMeshText.lookAt(this.camera.position);
      TweenMax.to(this.RoundTurnMeshText.scale,2,{x:2,y:2,z:2});
      TweenMax.to(this.RoundTurnMeshText.material,2,{opacity:0,onComplete:()=>{
        this.scene.remove(this.RoundTurnMeshText);
      }})
    }

    updateGold(count){
      if(this.GoldCountMesh) this.scene.remove(this.GoldCountMesh);
      this.goldCount = count;
      let GoldCountGeometryText = new THREE.TextBufferGeometry( this.goldCount+'', 
          {
              font: this.font,
              size: 1,
              height: 0,
              curveSegments: 12,
              bevelEnabled: false,
          } 
      );
      GoldCountGeometryText.computeBoundingBox(); 
      GoldCountGeometryText.translate( - 0.5 * ( GoldCountGeometryText.boundingBox.max.x - GoldCountGeometryText.boundingBox.min.x), 0, 0 );
  
      this.GoldCountMesh = new THREE.Mesh(GoldCountGeometryText, new THREE.MeshBasicMaterial({color:0xFFD700})); 
      this.scene.add(this.GoldCountMesh);
      this.GoldCountMesh.position.set(8.5,21,2.5);
      this.GoldCountMesh.rotation.set(Math.PI,Math.PI/2,Math.PI);
      // this.GoldCountMesh.lookAt(a.camera.position);
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

      let ok = document.createElement("div");
      ok.style.position = "absolute";
      ok.id = "ok";
      ok.style.left = "90%";
      ok.style.color = "white";
      ok.style.top = "90%";
      ok.innerText = "Готово";
      document.body.appendChild(ok);
      ok.addEventListener( 'click', bind(this.applyStartPack,this), false );
      let repick = document.createElement("div");
      repick.style.position = "absolute";
      repick.id = "repick";
      repick.style.left = "10%";
      repick.style.color = "white";
      repick.style.top = "90%";
      repick.innerText = "Перевыбрать";
      document.body.appendChild(repick);
      repick.addEventListener( 'click', bind(this.repickStartCards,this), false );

      let TimerGeometry = new THREE.BoxBufferGeometry( 1, 0.3, 10 );
      let TimerMaterial = new THREE.MeshBasicMaterial( {color: 0x156289} );
      this.TimerMesh = new THREE.Mesh( TimerGeometry, TimerMaterial );
      this.groupOf3Cards.add( this.TimerMesh );
      this.TimerMesh.position.set(1,5,2.5);
      this.TimerChooseAnimation = TweenMax.to(this.TimerMesh.scale,60,{z:0.001,onComplete:()=>{
        this.applyStartPack();
      }});


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
      this.groupOf3Cards.children[3].children[1].position.x += 0.05;
      this.groupOf3Cards.children[3].children[2].position.x += 0.05;
      this.groupOf3Cards.children[5].children[1].position.x -= 0.1;
      this.groupOf3Cards.children[5].children[2].position.x -= 0.1;
    }
  
    applyStartPack(){
      this.TimerChooseAnimation.kill();
      this.areaFriendly = new THREE.Mesh(new THREE.BoxBufferGeometry(10,1,50),new THREE.MeshBasicMaterial({color:0x156289,transparent:true,opacity:0.5}));
      this.scene.add(this.areaFriendly);
      this.areaFriendly.position.set(-7,20,26);
      let textGeometry = new THREE.TextBufferGeometry( 
`Завершить
    ход`, 
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
      this.endRoundButton = new THREE.Mesh(textGeometry, new THREE.MeshBasicMaterial({color:0xFFFFFF}));
      this.scene.add(this.endRoundButton);
      this.endRoundButton.position.set(-16,32,-6);
      this.endRoundButton.visible = false;
      this.endRoundButton.lookAt(this.camera.position);
      TweenMax.to(this.groupOf3Cards.children[0].material,1,{opacity:0,onComplete:()=>{
        this.groupOf3Cards.remove(this.groupOf3Cards.children[0]);
        this.groupOf3Cards.remove(this.groupOf3Cards.children[0]);
        this.groupOf3Cards.remove(this.groupOf3Cards.children[0]);
        document.getElementById("ok").remove();
        document.getElementById("repick").remove();
        for(let i = 0; i < this.groupOf3Cards.children.length; i++){
          TweenMax.to(this.groupOf3Cards.children[i].position,1,{x:1.9,y:-2})
        }
        SocketClientWorker.socket.emit('ChoosenCards',[this.groupOf3Cards.children[0].info,this.groupOf3Cards.children[1].info,this.groupOf3Cards.children[2].info]);
        
      }})
    }
    generateText(card){
        console.log(card);
        let textMaterial = new THREE.MeshBasicMaterial({color:0x000000});
        let tittleText = card.info.card_name;
        let tittle = new THREE.TextBufferGeometry( tittleText, 
        {
            font: this.font,
            size: 0.5,
            height: 0,
            curveSegments: 12,
            bevelEnabled: false,
        }
        
        );
        tittle.computeBoundingBox(); 
        tittle.translate( - 0.5 * ( tittle.boundingBox.max.x - tittle.boundingBox.min.x), 0, 0 );
        let textMesh = new THREE.Mesh(tittle,textMaterial);
        textMesh.rotation.x = Math.PI/2;
        textMesh.scale.set(0.2,0.2,0.2);
        textMesh.position.y = 0.01;
        textMesh.position.z = 1.15;
        textMesh.rotation.y = Math.PI;
        textMesh.rotation.z = Math.PI;

        card.add(textMesh);

        let descText = card.info.card_description;
        descText = descText.match(new RegExp('.{1,' + 16 + '}', 'g'));

        console.log(descText);
        descText = descText.join('\n');
        console.log(descText);
        let desc = new THREE.TextBufferGeometry( descText, 
        {
            font: this.font,
            size: 0.5,
            height: 0,
            curveSegments: 12,
            bevelEnabled: false,
        }
        
        );
        desc.computeBoundingBox(); 
        desc.translate( - 0.5 * ( desc.boundingBox.max.x - desc.boundingBox.min.x), 0, 0 );
        let descMesh = new THREE.Mesh(desc,textMaterial);
        descMesh.rotation.x = Math.PI/2;
        descMesh.scale.set(0.16,0.16,0.16);
        descMesh.position.y = 0.01;
        descMesh.position.z = 1.4;
        descMesh.rotation.y = Math.PI;
        descMesh.rotation.z = Math.PI;

        card.add(descMesh);
    
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
        var loader = new GLTFLoader().setPath( 'models/' );
            loader.load( 'field/field.glb', bind( function ( gltf ) {
                this.scene.add( gltf.scene );
                this.fscene = gltf.scene;
                this.camera.position.set(23,55,26);
                this.light.position.set(10,70,26);
                loader.load('card/card_models.glb',bind(function(gltf){
                  this.colodCard = gltf.scene.children[0];
                  this.fieldCard = gltf.scene.children[1];
                  console.log(this.colodCard);
                  let loadCounter = this.cards[0].length;
                  new THREE.TextureLoader().load("textures/card/card_default.jpg",bind((textureD)=>{
                    console.log("default loaded");
                    textureD.flipY = false;
                    this.colodCard.material.map = textureD;
                    new THREE.FontLoader().load( 'fonts/Montserrat Medium_Regular.json', bind(function ( font ){
                      this.font = font;
                      
                      for(let i = 0; i < this.cards[0].length; i++ ){
                        new THREE.TextureLoader().load(`${this.cards[0][i]["res_path"]}/hero_default.jpg`,bind((texture)=>{
                          texture.center = new THREE.Vector2(0.5,0.5);
                          texture.rotation = 1;
                          this.ourColodCardS.push(this.colodCard.clone())
                          this.ourColodCardS[this.ourColodCardS.length-1].children[0].material = new THREE.MeshLambertMaterial({map:texture});
                          this.ourColodCardS[this.ourColodCardS.length-1].info = this.cards[0][i];
                          this.generateText(this.ourColodCardS[this.ourColodCardS.length-1]);
                          loadCounter--;
                        },this));  
                      }
                      
                    },this))
                  },this))

                  let awaitLoadingTimer = setInterval(()=>{
                    if(loadCounter == 0){
                      SocketClientWorker.socket.emit("loadingReady");
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