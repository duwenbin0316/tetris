import React, { Component } from 'react';
import './App.css';

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
    this.state = {
      keyEvent: false,
      drawBorder: false
    }
  }

  componentDidMount() {
    this.ctx = this.canvas.getContext('2d')
    this.init()
  }

  init = () => {
    // 一个方格的宽高
    this.unitLen = 15
    // X偏移(单位为块)
    this.offsetX = 10
    // Y偏移（单位为块）
    this.offsetY = 30
    // 当前方块的X坐标（单位为块）
    this.currentX = 14
    // 当前方块的Y坐标（单位为块）
    this.currentY = -1
    // 当前刷新间隔时间(ms)
    this.currentSpeed = 200

    this.initCanvas()
  }

  initCanvas = () => {
    const {drawBorder} = this.state
    // 绘制一个宽30，高50的游戏画布
    if (!drawBorder) {
      this.ctx.strokeRect(this.offsetX - 1, this.offsetY - 1, 30*this.unitLen + 2, 50*this.unitLen + 2)

      this.setState({
        drawBorder: true
      })
    }

    // 记录数组
    this.resultArr = []
    for (let i = 0; i < 50; i++) {
      
      const row = []
      for (let j = 0; j < 30; j++) {
        row[j] = {
          flag: 0,
          color: null
        }
      }

      this.resultArr[i] = row
    }

    this.timer()

    // 键盘事件
    const {keyEvent} = this.state

    if (!keyEvent) {
      document.addEventListener('keydown', e => {
        switch (e.keyCode) {
          case 38: {
            this.move('top')
            break
          }
          case 40: {
            this.move('bottom')
            break
          }
          case 37: {
            this.move('left')
            break
          }
          case 39: {
            this.move('right')
            break
          }
          default: {
            break
          }
        }
      })

      this.setState({
        keyEvent: true
      })
    }
    
  }

  timer = () => {
    // 开启定时器
    this.gameTimer = setInterval(() => {
      // 清除上一步的方块
      this.move('bottom')
    }, this.currentSpeed)
  }

  refresh = () => {

    // 重绘方块
    if (!this.currentCube) {
      this.currentCube = this.randomCube()
    }

    // 计算生成的方块是否与已固定方块重叠
    let isCudeRender = true
    for (let i = 0; i < this.currentCube.length; i++) {

      if (i % 2 === 0) {
        const cor_X = this.currentCube[i]
        const cor_Y = this.currentCube[i + 1]

        if (this.resultArr[this.currentY + cor_Y][this.currentX + cor_X].flag === 1) {
          isCudeRender = false
          break
        }
      }
    }

    if (!isCudeRender) {
      clearInterval(this.gameTimer)
      // 清空画布重新开始
      this.ctx.clearRect(this.offsetX, this.offsetY, 30 * this.unitLen, 50 * this.unitLen)
      this.init()

      alert('GAME OVER!!!')

      return
    }

    this.drawCube()
  }

  randomCube = () => {
    // 随机颜色
    this.ctx.fillStyle = this.randomColor()
    // 随机选择一个方块
    this.index_1 = Math.round(Math.random() * 6)
    this.index_2 = Math.round(Math.random() * 3)

    return shaps[this.index_1][this.index_2]
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

  rotateCube = () => {
    // 旋转方块
    if (isNaN(this.index_2) || this.currentY < 0) {
      return
    }

    let newIndex
    
    if (this.index_2 === 3) {
      newIndex = 0
    } else {
      newIndex = this.index_2 + 1
    }
    

    const newCube = shaps[this.index_1][newIndex]

    // 计算是否超出界限或者是否会碰撞
    let shouldCubeRotate = true

    newCube.forEach((item, index) => {

      if (index % 2 === 0) {

        if (this.currentX + item < 0) {
          shouldCubeRotate = false
        } else if ((this.currentX + item + 1) > 30) {
          shouldCubeRotate = false
        } else if (this.resultArr[this.currentY + newCube[index + 1]][this.currentX + item].flag === 1) {
          shouldCubeRotate = false
        } else if ((this.currentY + newCube[index + 1] + 1) > 50) {
          shouldCubeRotate = false
        }
      }
    })
    
    if (shouldCubeRotate) {
      this.index_2 = newIndex
      this.clearCurrentCube()
      this.currentCube = shaps[this.index_1][this.index_2]
      this.drawCube()
    }
  }
  
  clearCurrentCube = () => {
    
    if (!this.currentCube || this.currentY === -1) {
      return
    }
    // 清除当前方块
    for (let i = 0; i< this.currentCube.length; i++) {
      if (i % 2 === 0) {
        this.clearRect(
          this.currentCube[i]*this.unitLen + this.currentX*this.unitLen + this.offsetX,
          this.currentCube[i+1]*this.unitLen + (this.currentY)*this.unitLen + this.offsetY
        )
      }
    }
  }

  drawRect = (x, y) => {
    this.ctx.fillRect(x, y, this.unitLen-1, this.unitLen-1)
  }

  clearRect = (x, y) => {
    this.ctx.clearRect(x, y, this.unitLen-1, this.unitLen-1)
  }

  randomColor = () => {
    //定义字符串变量colorValue存放可以构成十六进制颜色值的值
    const colorValue = "0,1,2,3,4,5,6,7,8,9,a,b,c,d,e,f"
    const colorArray = colorValue.split(",")

    let color="#"
    for (let i=0;i<6;i++) {
      color += colorArray[Math.floor(Math.random()*16)]
    }

    return color
  }
  
  testBorder = () => {

    if (!this.currentCube) {
      return true
    }

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

        if (index_Y < 50 && this.resultArr[index_Y][index_X].flag === 1) {
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

  testBorderX = (direction) => {

    if (!this.currentCube) {
      return false
    }

    // 计算方块的宽度
    let cubeWidth = 1

    for (let i = 0; i < this.currentCube.length; i++) {
      
      const item = this.currentCube[i]

      if (i % 2 === 0) {
        item + 1 > cubeWidth ? cubeWidth = item + 1 : null
      }
    }


    // 根据方向判断能否移动
    if (direction === 'left') {
      // 将要向左移动时
      if (this.currentX === 0) {
        // 如果方块已经在最左边，则不能再向左移动
        return false
      } else {
        // 遍历方块的每一个基本块，如果左边有已经落地的方块，则不能向左移动
        let shouldCubeMoveLeft = true
        this.currentCube.forEach((item, index) => {
          
          if (index % 2 === 0) {
            if (this.resultArr[this.currentY + this.currentCube[index + 1]][this.currentX + item - 1].flag === 1) {
              shouldCubeMoveLeft = false
            }
          }
        })

        return shouldCubeMoveLeft
      }
    } else if (direction === 'right') {
      // 将要向右移动时
      if ((this.currentX + cubeWidth) >= 30 ) {
        // 方块已处于最右边，不能继续向右移动
        return false
      } else {
        // 遍历方块的每一个基本块，如果右边有已经落地的方块，则不能向右移动
        let shouldCubeMoveRight = true
        this.currentCube.forEach((item, index) => {

          if (index % 2 === 0) {
            if (this.resultArr[this.currentY + this.currentCube[index + 1]][this.currentX + item + 1].flag === 1) {
              shouldCubeMoveRight = false
            }
          }
        })

        return shouldCubeMoveRight
      }
    }

  }

  move = (direction) => {

    if (!this.gameTimer) {
      return
    }

    switch (direction) {
      case 'top': {
        // 旋转方块
        this.rotateCube()
        break
      }
      case 'bottom': {

        if (this.testBorder()) {
          // 清除上一步的方块
          this.clearCurrentCube()
          
          // 画下一个状态的方块
          this.currentY = this.currentY + 1
          this.refresh()
        } else {
          // 记录停止移动的方块数据
          for (let i = 0; i< this.currentCube.length; i++) {
            
            if (i % 2 === 0) {
              const cor_X = this.currentCube[i]
              const cor_Y = this.currentCube[i+1]
              
              this.resultArr[this.currentY + cor_Y][this.currentX + cor_X] = {
                flag: 1,
                color: this.ctx.fillStyle
              }
            }
          }

          // 消行处理
          this.clearRow()
          
          // 方块位置初始化
          this.currentY = -1
          this.currentX = 14
  
          this.currentCube = null
        }
        break
      }
      case 'left': {
        // 如果能继续向左移动
        if (this.testBorderX('left')) {
          // 清除上一步的方块
          this.clearCurrentCube()

          // 画下一个状态的方块
          this.currentX = this.currentX - 1
          this.refresh()
        }
        break
      }
      case 'right': {
        // 如果能继续向左移动
        if (this.testBorderX('right')) {
          // 清除上一步的方块
          this.clearCurrentCube()

          // 画下一个状态的方块
          this.currentX = this.currentX + 1
          this.refresh()
        }
        break
      }
      default: {
        break
      }
    }
  }

  clearRow = () => {
    // 消行处理
    let clearIndexArr = []
    this.resultArr.forEach((item, index) => {

      let shouldClearRow = true
      item.forEach(t => {
        if (t.flag === 0) {
          shouldClearRow = false
        }
      })

      if (shouldClearRow) {
        // 记录当前行的索引
        clearIndexArr.push(index)
        // 清除当前整行
        this.resultArr[index] = item.map((t, i) => {
          this.clearRect(
            this.offsetX + i * this.unitLen,
            this.offsetY + index * this.unitLen
          )

          return 0
        })
      }

    })

    if (clearIndexArr.length > 0) {

      // 删除数组中对应的项
      this.resultArr = this.resultArr.filter((t, i) => clearIndexArr.indexOf(i) === -1)

      // 追加相应数目的空行
      clearIndexArr.forEach(t => {
        // 生成一个长度为30的数组
        let arr = []
        for (let i = 0; i < 30; i++) {
          arr = [
            ...arr,
            {
              flag: 0,
              color: null
            }
          ]
        }

        this.resultArr = [arr, ...this.resultArr]
      })

      // 清空画布，重绘
      this.ctx.clearRect(
        this.offsetX,
        this.offsetY,
        this.unitLen * 30,
        this.unitLen * 50
      )

      this.resultArr.forEach((item, index) => {

        item.forEach((t, i) => {
          const {color} = t
          if (color) {
            this.ctx.fillStyle = color

            this.drawRect(
              this.offsetX + i * this.unitLen,
              this.offsetY + index * this.unitLen
            )
          }
        })
      })
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
