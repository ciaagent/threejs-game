import { AfterViewInit, Component, ElementRef, HostListener, Input, OnInit, ViewChild } from '@angular/core';
import * as THREE from 'three';

@Component({
  selector: 'app-cube',
  templateUrl: './cube.component.html',
  styleUrls: ['./cube.component.scss']
})
export class CubeComponent implements OnInit, AfterViewInit {
  @ViewChild('canvas')
  private canvasRef!: ElementRef;

  //Cube properties
  @Input() public rotationSpeedX:  number = 0.005;
  @Input() public rotationSpeedY:  number = 0.01;
  @Input() public size:  number = 200;
  @Input() public texture:  string = '/assets/crate.gif';

  // Stage properties
  @Input() public cameraZ:  number = 200;
  @Input() public fieldOfView:  number = 1;
  @Input('nearClipping') public nearClippingPlane:  number = 1;
  @Input('farClipping') public farClippingPlane:  number = 1000;

  private camera!: THREE.PerspectiveCamera;
  private loader = new THREE.TextureLoader();
  private geometry = new THREE.BoxGeometry(1,1,1);
  private material = new THREE.MeshPhongMaterial({map: this.loader.load(this.texture)});
  //private material = new THREE.MeshBasicMaterial({color: 0xFFFFFF});

  private cube: THREE.Mesh = new THREE.Mesh(this.geometry, this.material);

  private renderer!: THREE.WebGLRenderer;

  private scene!: THREE.Scene;

  constructor() { }

  ngOnInit(): void {
  }

  private get canvas(): HTMLCanvasElement {
    return this.canvasRef.nativeElement;
  }

  private createScene(){
    
    // Scene
    this.scene = new THREE.Scene;
    this.scene.background = new THREE.Color(0x000000);
    this.scene.add( new THREE.AmbientLight( 0x222222, 1 ) );
    this.scene.add(this.cube);
    //this.scene.add( new THREE.AxesHelper( 20 ) );
    // Camera
    let aspectRatio = this.getAspectRatio();
    this.camera = new THREE.PerspectiveCamera(
      this.fieldOfView,
      aspectRatio,
      this.nearClippingPlane,
      this.farClippingPlane
    )
    this.camera.position.z = this.cameraZ;
    const light = new THREE.PointLight( 0x222222, 5);
    this.camera.add( light );
    this.scene.add(this.camera);

    // controls
    // const controls = new THREE.OrbitControls( this.camera, this.renderer.domElement );
    // controls.minDistance = 20;
    // controls.maxDistance = 50;
    // controls.maxPolarAngle = Math.PI / 2;
  }

  private getAspectRatio(): number {
    return this.canvas.clientWidth / this.canvas.clientHeight;
  }

  private animateCube(){
    this.cube.rotation.x += this.rotationSpeedX;
    this.cube.rotation.y += this.rotationSpeedY;
  }

  private startRenderingLoop(){
    // Renderer
    // Use canvas element in template
    this.renderer = new THREE.WebGLRenderer({canvas: this.canvas});
    this.renderer.setPixelRatio(devicePixelRatio);
    this.renderer.setSize(this.canvas.clientWidth, this.canvas.clientHeight);

    let component: CubeComponent = this;
    (function render(){
      requestAnimationFrame(render);
      component.animateCube();
      component.renderer.render(component.scene, component.camera);
    }());
  }

  ngAfterViewInit(): void {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
    this.createScene();
    this.startRenderingLoop();
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: Event) {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
    this.camera.aspect = window.innerWidth / window.innerHeight;
		this.camera.updateProjectionMatrix();
    this.renderer.setSize( window.innerWidth, window.innerHeight );
  }

  // onDocumentMouseMove( event: MouseEvent ) {

  //   mouseX = ( event.clientX - windowHalfX );
  //   mouseY = ( event.clientY - windowHalfY );

  // }

}
