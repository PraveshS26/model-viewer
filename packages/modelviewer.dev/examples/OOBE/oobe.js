import {Data} from './data.js';
import {DisplayCanvas} from './displaycanvas.js';
import * as JSInterface from './JSInterface.js';

const mv = document.querySelector('model-viewer');
const nextButton = document.querySelector('#next');
const backButton = document.querySelector('#back');
const skipButton = document.querySelector('#skip');

class App {
  constructor() {
    this.currentAnimClipState = null;
    this.currentState = null;
    this.animReverse = false;
    this.callout_w_dots = false;
    this.anim_clip = null;
  }

  async init() {
    // Parse data from interaction scripts
    const json_data = new Data();
    const interaction_states_data =
        await json_data.getData('interaction_states.json');
    this.interaction_states = interaction_states_data.stages;
    this.callout_data = interaction_states_data.callouts[0];
    // this.interaction.calloutData = this.callout_data;

    // set up div to contain spin indicator
    const spinIndicator = document.getElementById('spin-icon-container');
    spinIndicator.addEventListener('animationend', () => {
      spinIndicator.style.display = 'none';
    }, false);

    console.log('Setting states for ' + this.interaction_states.length);
    
    // TODO: JSInterface is the communication back to Android about button
    // states, etc. Replace this with communication to HTML/CSS.
    // JSInterface.setStateParameters(this.interaction_states.length, false);

    this.yellow_color = '0xe6ff7b';  // KHR_materials_unlit

    this.display_material =
        mv.model.getMaterialByName('rohan_anim:rohan_rig:DISPLAY_MAT');

    this.canvas_texture = mv.createCanvasTexture();
    // Generate Clock Texture
    this.display_canvas = new DisplayCanvas(this.canvas_texture.source.element);

    this.display_material.emissiveTexture.setTexture(this.canvas_texture);
    this.canvas_texture.source.update();

    this.setSku(2);

    let introFade = document.getElementById('intro-fade');
    introFade.classList.add('active');

    requestAnimationFrame(this.animate.bind(this));

    // Add Mixer Event Listener to run after animation is finished.
    mv.addEventListener('finished', function() {
      console.log(mv.animationName + ' - Complete');
      console.log(this.loopFinished);
      let follow_up_anim = this.currentAnimClipState.followupAnimClipName[0];
      let reverse_follow_up_anim = this.currentAnimClipState ?
          this.currentAnimClipState.followupAnimReverseClipName[0] :
          null;

      // try {
      //   if (mv.animationName != Object.keys(follow_up_anim)[0])
      //   this.interaction.setRotationTo(this.currentState.freeRotate, 0);
      // } catch (err) {
      //   console.log('No follow up animation in this state.');
      // }

      if (follow_up_anim &&
          mv.animationName == this.currentAnimClipState.fbxClipName &&
          !this.animReverse) {
        let follow_up_anim_key = Object.keys(follow_up_anim)[0];
        this.playAnimation(
            follow_up_anim_key,
            false,
            follow_up_anim[follow_up_anim_key].looping,
            null,
            true);
        setTimeout(function() {
          this.loopFinished = true;
        }.bind(this), 700);
      }
      if (reverse_follow_up_anim &&
          mv.animationName == this.currentAnimClipState.fbxClipNameReverse &&
          this.animReverse) {
        let reverse_follow_up_anim_key = Object.keys(reverse_follow_up_anim)[0];
        this.playAnimation(
            reverse_follow_up_anim_key,
            false,
            reverse_follow_up_anim[reverse_follow_up_anim_key].looping,
            null,
            true);
      }
      if (this.interactiveIntroAnim && mv.animationName == '_BandOff') {
        this.playAnimation('_RSB_Press', false, true, null, true);
        this.interactiveIntroAnim = false;
      }

      // this.interaction.transitionSpeed = 0.1;
    }.bind(this));
  }

  animate() {
    this.display_canvas.update();
    this.canvas_texture.source.update();
    requestAnimationFrame(this.animate.bind(this));
  }

  startAnimations(stateId) {
    console.log('removing fade');
    let introFade = document.getElementById('intro-fade');
    introFade.classList.remove('active');
    introFade.classList.add('disabled');
    this.setSceneState(stateId)
  }

  setSwipingEnabled(setting) {
    window.enableSwiping = boolean(setting);
  }

  async playAnimation(clipName, reverse, looping, startTime, follow_up) {
    mv.animationName = clipName;
    await mv.updateComplete;
    mv.timeScale = reverse ? -1 : 1;
    if (startTime) {
      mv.currentTime = startTime;
    }
    mv.play({repetitions: looping ? Infinity : 1});
  }

  async setSceneState(id, reverse = false) {
    // Get interaction_states json values and set them as const
    this.animReverse = reverse;
    this.currentState = this.interaction_states[id];

    console.log("Current state: " + this.currentState.name);
    JSInterface.setStateParameters(this.currentState, this.callout_data);

    this.currentAnimClipState =
        reverse ? this.interaction_states[id + 1] : this.currentState;
    const lottie_animation_file = this.currentState.lottieAnimation;
    const lottie_animation_additive_file =
        this.currentState.lottieAnimationAdditive;
    const lottie_rotation = this.currentState.lottieRotation;
    const lottie_loop = this.currentState.lottieLoop;
    const lottie_offset = this.currentState.lottieOffset;
    const lottie_scale = this.currentState.lottieScale;
    const lottie_timeout = reverse ? this.currentState.lottieTimeoutReverse :
                                     this.currentState.lottieTimeout;
    // const pivot_object =
    //     this.scene.getObjectByName(this.currentState.pivotTarget);
    // const prev_pivot_object =
    //     this.scene.getObjectByName(this.currentAnimClipState.pivotTarget);
    const hide_web_view = this.currentState.hideWebView;
    const custom_display = this.currentState.customDisplay;
    const camera_near_clip = this.currentState.cameraNearClip;
    const lottie_display = this.currentState.lottieDisplay;
    const runMagnifyGlass = this.currentState.runMagnifyGlass;
    this.loadMagnifyGlass = false;

    if (runMagnifyGlass) {
      setTimeout(function() {
        if (this.currentState.runMagnifyGlass)
          this.loadMagnifyGlass = true;
      }.bind(this), 1500);
    }

    // if custom display is not null, replace watch face with custom display
    // texture
    let custom_texture = this.canvas_texture;
    if (custom_display) {
      const url = './textures/' + custom_display;
      if (custom_display.split('.').pop() == 'mp4') {
        custom_texture = mv.createVideoTexture(url);
      } else {
        custom_texture = await mv.createTexture(url);
      }
    } else if (lottie_display) {
      custom_texture =
          await mv.createLottieTexture('./textures/' + lottie_display);
    }
    this.display_material.emissiveTexture.setTexture(custom_texture);

    // show callouts, if there are some, at the end of the transition animation
    // this.uicontrol.showDots = this.currentState.showDots;
    // this.uicontrol.showCallouts(this.currentState.showCallout,
    // this.darkMode);

    let state;
    // Get target for camera at current state
    // for (state in this.interaction_states) {
    //   const pivot = this.scene.getObjectByName(
    //       this.interaction_states[state].pivotTarget);
    //   pivot.rotation.set(0, 0, 0);
    // }

    const looping = this.currentAnimClipState.looping;
    const start_time = reverse ? this.currentAnimClipState.startTimeReverse :
                                 this.currentAnimClipState.startTime;

    // this.interaction.transitionSpeed =
    //     this.currentAnimClipState.transitionSpeed ?
    //     this.currentAnimClipState.transitionSpeed :
    //     0.1;
    // this.interaction.touchRotateMultiplier =
    //     this.currentState.touchRotateMultiplier;
    // this.interaction.deviceRotateMultiplier =
    //     this.currentState.deviceRotateMultiplier;

    // If previous animation has a time condition flag, play alternate animation
    // based on where the previous animation was when the state is switched
    var clip_name = this.currentAnimClipState.fbxClipName;

    // // Set the camera target to pivot from interaction states json, set
    // camera
    // // controls, and play animation
    // this.interaction.setTarget(this.hrn, pivot_object);
    // this.interaction.setRotationTo(this.currentState.freeRotate, 0);
    // this.currentState.freeRotate ? this.interaction.addVelocity = true :
    //                                this.interaction.addVelocity = false;
    this.playAnimation(clip_name, reverse, looping, start_time, false);
  }

  setSku(color) {
    let bandColor;
    let hourColor;
    let secondColor;
    let frameColor;
    switch (color) {
      case 1:
        bandColor = '#e3c49f';
        hourColor = '#ffd4b6';
        secondColor = '#e78e4e';
        frameColor = '#bcbcbc';
        break;
      case 2:
        bandColor = '#b3b555';
        hourColor = '#ebffc3';
        secondColor = '#b2e154';
        frameColor = '#c79d6d';
        break;
      case 3:
        bandColor = '#020202';
        hourColor = '#e4e4e4';
        secondColor = '#b0b0b0';
        frameColor = '#151515';
        break;
      case 4:
        bandColor = '#8c9183';
        hourColor = '#ebffc3';
        secondColor = '#b2e154';
        frameColor = '#c79d6d';
        break;
      default:
        bandColor = '#202021';
        hourColor = '#e4e4e4';
        secondColor = '#b0b0b0';
        frameColor = '#151515';
    }
    const bandMaterial =
        mv.model.getMaterialByName('rohan_anim:rohan_rig:BAND_MAT');
    const frameMaterial =
        mv.model.getMaterialByName('rohan_anim:rohan_rig:PUCK_MAT');
    bandMaterial.pbrMetallicRoughness.setBaseColorFactor(bandColor);
    frameMaterial.pbrMetallicRoughness.setBaseColorFactor(frameColor);
    this.display_canvas.hourColor = hourColor;
    this.display_canvas.secondColor = secondColor;
  }
}

const app = new App();

mv.addEventListener('load', async () => {
  await app.init();
  let id = 0;
  app.setSceneState(id);


  function setButtons(id) {
    nextButton.disabled = id === app.interaction_states.length - 1;
    backButton.disabled = id == 0;
  }

  // TODO: How is skip different than next on dots steps?
  skipButton.addEventListener('click', () => {
    app.setSceneState(++id);
    setButtons(id);
  });

  nextButton.addEventListener('click', () => {
    app.setSceneState(++id);
    setButtons(id);
  });
  backButton.addEventListener('click', () => {
    app.setSceneState(--id, true);
    setButtons(id);
  });
});