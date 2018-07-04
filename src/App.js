import React, { Component } from 'react';
import './App.css';
import { ECONNABORTED } from 'constants';

const shap1 = [[0,0,1,0,1,1,1,2],[0,1,1,1,2,1,2,0],[0,0,0,1,0,2,1,2],[0,0,1,0,2,0,0,1]]
const shap2 = [[0,0,0,1,0,2,1,0],[0,0,1,0,2,0,2,1],[0,2,1,0,1,1,1,2],[0,0,0,1,1,1,2,1]]
const shap3 = [[0,0,1,0,1,1,2,1],[1,0,1,1,0,1,0,2],[0,0,1,0,1,1,2,1],[1,0,1,1,0,1,0,2]]
const shap4 = [[0,1,1,0,1,1,2,0],[0,0,0,1,1,1,1,2],[0,1,1,0,1,1,2,0],[0,0,0,1,1,1,1,2]]
const shap5 = [[0,0,1,0,0,1,1,1],[0,0,1,0,0,1,1,1],[0,0,1,0,0,1,1,1],[0,0,1,0,0,1,1,1]]
const shap6 = [[0,1,1,1,2,1,1,0],[0,0,0,1,0,2,1,1],[0,0,1,0,2,0,1,1],[1,0,1,1,0,1,1,2]]
const shap7 = [[0,0,1,0,2,0,3,0],[0,0,0,1,0,2,0,3],[0,0,1,0,2,0,3,0],[0,0,0,1,0,2,0,3]]
const shaps = [shap1, shap2, shap3, shap4, shap5, shap6, shap7]

class App extends Component {

  constructor() {
    super()
    this.state = {}
  }

  componentDidMount() {
    this.ctx = this.canvas.getContext('2d')

    // 一个方格的宽高
    this.unitLen = 15
    // X偏移(单位为块)
    this.offsetX = 10
    // Y偏移（单位为块）
    this.offsetY = 30
    // 当前方块的X坐标（单位为块）
    this.currentX = 14
    // 当前方块的Y坐标（单位为块）
    this.currentY = 0
    // 当前刷新间隔时间(ms)
    this.currentSpeed = 50

    this.initCanvas()
  }

  initCanvas = () => {
    // 绘制一个宽30，高50的游戏画布
    this.ctx.strokeRect(this.offsetX, this.offsetY-1, 30*this.unitLen, 50*this.unitLen)

    // 记录数组
    this.resultArr = []
    for (let i = 0; i < 50; i++) {
      const row = []

      for (let j = 0; j < 30; j++) {
        row[j] = 0
      }
      this.resultArr[i] = row
    }

    this.timer()
  }

  timer = () => {
    // 开启定时器
    this.gameTimer = setInterval(() => {
      // 清除上一步的方块
      if (this.currentCube) {
        for (let i = 0; i< this.currentCube.length; i++) {

          if (i % 2 === 0) {
            this.clearRect(
              this.currentCube[i]*this.unitLen + this.currentX*this.unitLen + this.offsetX,
              this.currentCube[i+1]*this.unitLen + (this.currentY - 1)*this.unitLen + this.offsetY
            )
          }
        }
      }

      this.refresh()
      if (this.testBorder()) {
        this.currentY = this.currentY + 1
      } else {
        // 记录停止移动的方块数据
        for (let i = 0; i< this.currentCube.length; i++) {
          
          if (i % 2 === 0) {
            const cor_X = this.currentCube[i]
            const cor_Y = this.currentCube[i+1]
            
            this.resultArr[this.currentY + cor_Y][this.currentX + cor_X] = 1
          }
        }
        
        this.currentY = 0

        this.currentCube = null
      }
    }, this.currentSpeed)
  }

  refresh = () => {

    // 重绘方块
    if (!this.currentCube) {
      this.currentCube = this.randomCube()

      // 计算生成的方块是否与已固定方块重叠
      let isCudeRender = true
      for (let i = 0; i < this.currentCube.length; i++) {

        if (i % 2 === 0) {
          const cor_X = this.currentCube[i]
          const cor_Y = this.currentCube[i + 1]

          if (this.resultArr[this.currentY + cor_Y][this.currentX + cor_X] === 1) {
            isCudeRender = false
            break
          }
        }
      }

      if (!isCudeRender) {
        alert('GAME OVER!!!')
      }
    }
    this.drawCube()
  }

  randomCube = () => {
    // 随机选择一个方块
    return shaps[Math.round(Math.random()*6)][Math.round(Math.random()*3)]
  }

  drawCube = () => {
    // 绘制方块
    this.currentCube.forEach((item, index) => {
      if (index % 2 === 0) {
        this.drawRect(
          this.currentX*this.unitLen + item*this.unitLen + this.offsetX, 
          this.currentY*this.unitLen + this.currentCube[index + 1]*this.unitLen  + this.offsetY)
      }
    })
  }

  drawRect = (x, y) => {
    this.ctx.fillRect(x, y, this.unitLen-1, this.unitLen-1)
  }

  clearRect = (x, y) => {
    this.ctx.clearRect(x, y, this.unitLen-1, this.unitLen-1)
  }
  
  testBorder = () => {
    // 根据当前方块的位置，计算是否能继续前进
    let cubeHeight = 1

    for (let i = 0; i < this.currentCube.length; i++) {
      
      const item = this.currentCube[i]

      if (i % 2 === 1) {
        item + 1 > cubeHeight ? cubeHeight = item + 1 : null
      }
    }


    // 计算方块下一步是否会碰撞到已经落地的方块
    let isCubeForward = true
    for (let i = 0; i < this.currentCube.length; i++) {

      if (i % 2 === 0) {
        const cor_X = this.currentCube[i]
        const cor_Y = this.currentCube[i + 1]

        const index_X = this.currentX + cor_X
        const index_Y = this.currentY + cor_Y + 1

        if (index_Y < 50 && this.resultArr[index_Y][index_X] === 1) {
          isCubeForward = false
          break
        }
      }
    }


    if (!isCubeForward) {
      return false
    } else if (this.currentY + cubeHeight + 1 > 50) {
      return false
    } else {
      return true
    }
  }

  render() {
    return (
      <div className="App">
        <canvas id="canvas" width="600" height="800" ref={canvas => this.canvas = canvas}>
          Your browser does not support canvas!
        </canvas>
      </div>
    );
  }
}

export default App;
