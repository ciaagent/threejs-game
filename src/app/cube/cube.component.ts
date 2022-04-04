import { AfterViewInit, Component, ElementRef, HostListener, Input, OnInit, ViewChild } from '@angular/core';
import * as THREE from 'three';
import { GUI } from 'dat.gui'
import { PointLight } from 'three';
@Component({
  selector: 'app-cube',
  templateUrl: './cube.component.html',
  styleUrls: ['./cube.component.scss']
})
export class CubeComponent implements OnInit, AfterViewInit {
  @ViewChild('canvas')
  private canvasRef!: ElementRef;

  //Cube properties
  @Input() public rotationSpeedX:  number = 0;
  @Input() public rotationSpeedY:  number = 0.01;
  @Input() public size:  number = 200;
  @Input() public texture:  string = '/assets/crate.gif';

  // Stage properties
  @Input() public cameraZ:  number = 4;
  @Input() public fieldOfView:  number = 100;
  @Input('nearClipping') public nearClippingPlane:  number = 0.1;
  @Input('farClipping') public farClippingPlane:  number = 100;

  private camera!: THREE.PerspectiveCamera;
  private loader = new THREE.TextureLoader();
  private renderer!: THREE.WebGLRenderer;
  private scene!: THREE.Scene;


  private geometry = new THREE.BoxGeometry(1,1,1);
  //private geometry = new THREE.TorusGeometry( .7, .2, 16, 100 );
  //private material = new THREE.MeshBasicMaterial({color: 0xFFFFFF});
  private material = new THREE.MeshStandardMaterial({map: this.loader.load(this.texture)});
  private cube: THREE.Mesh = new THREE.Mesh(this.geometry, this.material);

  // Lighting
  private ambientLight = new THREE.AmbientLight( 0x222222, 1 );
  private cameraLight = new THREE.PointLight( 0xffffff, 0.1);
  private pointLightHelper =new THREE.PointLightHelper(this.cameraLight, 1);


  // Debugging stuffs
  private gui = new GUI();
  private cubeFolder = this.gui.addFolder('Cube');
  private cameraFolder = this.gui.addFolder('Camera');
  private ambientLightFolder = this.gui.addFolder('Ambient Light');
  private cameraLightFolder = this.gui.addFolder('Camera Light');

  constructor() {}

  ngOnInit(): void {
  }

  private get canvas(): HTMLCanvasElement {
    return this.canvasRef.nativeElement;
  }

  private createScene(){
    this.material.metalness = 0.7;
    this.material.roughness = 0.2;
    // Scene
    this.scene = new THREE.Scene;
    //this.scene.background = new THREE.Color(0x000000);
    this.scene.add(this.ambientLight);
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
    this.camera.add(this.cameraLight);
    this.scene.add(this.camera);
    this.scene.add(this.pointLightHelper);
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
    this.renderer = new THREE.WebGLRenderer({canvas: this.canvas, alpha: true});
    this.renderer.setPixelRatio(devicePixelRatio);
        this.renderer.setSize(this.canvas.clientWidth, this.canvas.clientHeight);

    let component: CubeComponent = this;
    (function render(){
      requestAnimationFrame(render);
      component.animateCube();
      component.renderer.render(component.scene, component.camera);
    }());
  }

  private loadDebugGUI(): void{
    this.cubeFolder.add(this.cube.rotation, 'x', 0, Math.PI * 2)
    this.cubeFolder.add(this.cube.rotation, 'y', 0, Math.PI * 2)
    this.cubeFolder.add(this.cube.rotation, 'z', 0, Math.PI * 2)
    this.cubeFolder.open()
    
    this.cameraFolder.add(this.camera.position, 'z', 0, 15)
    this.cameraFolder.open()

    this.ambientLightFolder.add(this.ambientLight, 'intensity', 0, 20);
    this.ambientLightFolder.open()

    this.cameraLightFolder.add(this.cameraLight, 'intensity', 0, 20);
    this.cameraLightFolder.add(this.cameraLight.position, 'x', -3, 3, 0.01);
    this.cameraLightFolder.add(this.cameraLight.position, 'y', -3, 3, 0.01);
    this.cameraLightFolder.add(this.cameraLight.position, 'z', -20, 3, 0.01);
    this.cameraLightFolder.open()
  }

  ngAfterViewInit(): void {
    this.createScene();
    this.startRenderingLoop();
    
    // Debug GUI
    this.loadDebugGUI();

  }

  @HostListener('window:resize', ['$event'])
  onResize(event: Event) {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
    this.camera.aspect = this.canvas.width / this.canvas.height;
		this.camera.updateProjectionMatrix();
    this.renderer.setSize( this.canvas.width, this.canvas.height );
  }

}
