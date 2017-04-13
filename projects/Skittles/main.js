/// <reference path="../../libs/oimo/oimo.js" />


"use strict"

window.addEventListener('DOMContentLoaded', function () { main(); });

function main() {
  setupScene();

  (function render() {
    requestAnimationFrame(render);
  })();

  function setupScene() {
    document.addEventListener('mousedown', onDocumentMouseDown(), false);
    function onDocumentMouseDown() {
      var raycaster = new THREE.Raycaster();
      var mouse = new THREE.Vector2();
      var objects = [];
      var selected;

      return function (event) {
        event.preventDefault();

        mouse.x = (event.clientX / renderer.domElement.clientWidth) * 2 - 1;
        mouse.y = -(event.clientY / renderer.domElement.clientHeight) * 2 + 1;

        raycaster.setFromCamera(mouse, camera);

        var intersects = raycaster.intersectObjects(scene.children);

        if (intersects.length > 0) {
          selected = intersects[0].object;
        } else {
        }
      }
    }

    window.addEventListener('resize', onWindowResize, false);
    function onWindowResize() {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    }

    var glCanvas = document.getElementById("glcanvas");
    var scene = new THREE.Scene();
    var camera = new THREE.PerspectiveCamera(45, glCanvas.clientWidth / glcanvas.clientHeight, 0.1, 1000);
    camera.position.x = -150;
    camera.position.y = 50;
    camera.position.z = 50;

    var renderer = new THREE.WebGLRenderer({ canvas: glCanvas, alpha: true });
    renderer.setSize(glCanvas.clientWidth, glcanvas.clientHeight);
    renderer.shadowMap.enabled = true;

    renderer.setClearColor(0xEEEEEE, 1);

    var light = new THREE.AmbientLight(0x202020); // soft white light
    scene.add(light);

    var spotLight = new THREE.SpotLight(0xffffff, 1, 1000, Math.PI / 8);
    spotLight.castShadow = true;

    spotLight.shadow.mapSize.width = 1024 * 4;
    spotLight.shadow.mapSize.height = 1024 * 4;

    spotLight.penumbra = 0.05;
    spotLight.shadow.camera.near = 5;
    spotLight.shadow.camera.far = 40000;
    spotLight.shadow.camera.fov = 30; 
    spotLight.position.set(60, 300, 60);
    scene.add(spotLight);

    var ball = new THREE.Mesh(
      new THREE.SphereGeometry(5, 16, 16),
      new THREE.MeshPhongMaterial({ color: 0x804000 })
    );
    ball.castShadow = true;
    ball.position.y = 5;
    ball.position.z = 90;
    scene.add(ball);

    var floor = new THREE.Mesh(
      new THREE.PlaneGeometry(100, 200),
      new THREE.MeshPhongMaterial({ color: 0x00ff00 })
    );
    floor.receiveShadow = true;
    floor.rotateX(-Math.PI / 2);
    scene.add(floor);

    var skittles = [];

    for (var i = 0; i < 4; i++) {
      for (var j = 0; j < i + 1; j++) {
        var mesh = new THREE.Mesh(
          new THREE.CylinderGeometry(3, 3, 15, 16),
          new THREE.MeshPhongMaterial({ color: 0xee4444 })
        );
        mesh.rotateY(Math.PI / 2);
        mesh.castShadow = true;
        mesh.position.set((i / 2 - j) * 10, 7.5, -50 - i * 10);
        skittles.push(mesh);
        scene.add(mesh);
      }
    }

    var orbitControl = new THREE.OrbitControls(camera, renderer.domElement);

    var world = new OIMO.World({
      timestep: 1 / 60,
      iterations: 8,
      broadphase: 2, // 1 brute force, 2 sweep and prune, 3 volume tree
      worldscale: 1, // scale full world 
      random: true,  // randomize sample
      info: false,   // calculate statistic or not
      gravity: [0, -9.8, 0]
    });

    var ball_body = world.add({
      type: 'sphere', // type of shape : sphere, box, cylinder 
      size: [ball.geometry.parameters.radius, ball.geometry.parameters.radius, ball.geometry.parameters.radius],//[1, 1, 1], // size of shape
      pos: ball.position.toArray(),// getWorldPosition(),//[0, 0, 0], // start position in degree
      move: true, // dynamic or statique
      density: 1,
      friction: 0.02,
      restitution: 0.2,
      belongsTo: 1, // The bits of the collision groups to which the shape belongs.
      collidesWith: 0xffffffff // The bits of the collision groups with which the shape collides.
    });
    ball_body.applyImpulse(new OIMO.Vec3(0, 0, 0), new OIMO.Vec3(5000 - Math.random() * 10000, 0, -50000));

    var floor_body = world.add({
      type: 'box', // type of shape : ball, box, cylinder 
      size: [floor.geometry.parameters.width, .100, floor.geometry.parameters.height], // [1, 1, 1], // size of shape
      pos: floor.position.toArray(),// getWorldPosition(),//[0, 0, 0], // start position in degree
      move: false, // dynamic or statique
      density: .01,
      friction: 0.02,
      restitution: 0.2,
      belongsTo: 1, // The bits of the collision groups to which the shape belongs.
      collidesWith: 0xffffffff // The bits of the collision groups with which the shape collides.
    });

    var skittle_bodies = [];
    for (var i = 0; i < skittles.length; i++) {
      var body = skittles[i];

      var t = world.add({
        type: 'cylinder', // type of shape : ball, box, cylinder 
        size: [body.geometry.parameters.radiusTop, body.geometry.parameters.height], // [1, 1, 1], // size of shape
        pos: body.position.toArray(),// getWorldPosition(),//[0, 0, 0], // start position in degree
        rot: [0, 45, 0], // start rotation in degree
        move: true, // dynamic or statique
        density: 1,
        friction: 0.2,
        restitution: 0.2,
        belongsTo: 1, // The bits of the collision groups to which the shape belongs.
        collidesWith: 0xffffffff // The bits of the collision groups with which the shape collides.
      });

      skittle_bodies.push(t);
    }

    function resetPins() {
      var k = 0;
      for (var i = 0; i < 4; i++) {
        for (var j = 0; j < i + 1; j++) {
          skittle_bodies[k].resetRotation(0, Math.PI / 2, 0);
          skittle_bodies[k++].resetPosition((i / 2 - j) * 10, 7.5, -50 - i * 10);
        }
      }

      ball_body.resetPosition(0, 5, 90);
      ball_body.applyImpulse(new OIMO.Vec3(0, 0, 0), new OIMO.Vec3(5000 - Math.random() * 10000, 0, -50000));
      setTimeout(resetPins, 10000);
    }

    setTimeout(resetPins,10000);

    render();
    function render() {
      requestAnimationFrame(render);
      renderer.render(scene, camera);
      orbitControl.update();

      world.step();

      ball.position.copy(ball_body.getPosition());
      for (var i = 0; i < skittles.length; i++) {
        skittles[i].position.copy(skittle_bodies[i].getPosition());
        skittles[i].quaternion.copy(skittle_bodies[i].getQuaternion());
      }
    }
  }
}