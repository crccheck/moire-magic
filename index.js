import './index.scss'

const $back = $('.back > svg')
const $face = $('.face > svg')
const $pattern = $('.pattern')
const $patternb = $('.patternb')

const CROP = 50
const BLEED = CROP + 25
const Y_MIN = 0 - CROP
const Y_MAX = 100 + CROP
const HEIGHT = 100 + 2 * CROP

class Designer {
  constructor(
    $reference,
    $root,
    beg = [[20, -20], [50, 20]],
    end = [[20, 50], [70, 100]]
  ) {
    this.beg = beg
    this.end = end
    this.$ref = $reference
    this.$refSvg = $reference.find('svg')
    this.$root = $root
    this.order = 1
    this.pitch = 2
    this.m = this.$refSvg[0].getScreenCTM().inverse()
    this.setup()
  }

  toString() {
    return [this.order, this.pitch, this.beg.slice(0, this.order), this.end.slice(0, this.order)].join('|')
  }

  setup() {
    const self = this;
    this.$refSvg.attr('viewBox', `${-CROP} ${-BLEED} ${100 + 2 * CROP} ${100 + 2 * BLEED}`)
    this.m = this.$refSvg[0].getScreenCTM().inverse()
    this.$refSvg.on('click', function(evt, b) {
      const x = evt.pageX * self.m.a + self.m.e
      const y = evt.pageY * self.m.d + self.m.f
      const idx = evt.ctrlKey || evt.metaKey ? 1: 0
      if (evt.shiftKey) {
        self.end[idx] = [x, y]
      } else {
        self.beg[idx] = [x, y]
      }
      self.draw()
    })
    this.$ref.find('input[type="radio"]').on('click', function () {
      self.order = +this.value
      self.draw()
    })
  }

  getLinear(i) {
    return `<line x1="-10" y1="${i}" x2="110" y2="${i}" stroke="black" stroke-width="1" />`
  }

  getQuadratic(i) {
    const tweenX = this.beg[0][0] + (i + CROP) / HEIGHT * (this.end[0][0] - this.beg[0][0])
    const tweenY = this.beg[0][1] + (i + CROP) / HEIGHT * (this.end[0][1] - this.beg[0][1])
    return `<path d="M-10 ${i} Q ${tweenX} ${tweenY}, 110 ${i}" stroke="black" stroke-width="1" fill="transparent" />`
  }

  getCubic(i) {
    const tweenX1 = this.beg[0][0] + (i + CROP) / HEIGHT * (this.end[0][0] - this.beg[0][0])
    const tweenY1 = this.beg[0][1] + (i + CROP) / HEIGHT * (this.end[0][1] - this.beg[0][1])
    const tweenX2 = this.beg[1][0] + (i + CROP) / HEIGHT * (this.end[1][0] - this.beg[1][0])
    const tweenY2 = this.beg[1][1] + (i + CROP) / HEIGHT * (this.end[1][1] - this.beg[1][1])
    return `<path d="M-10 ${i} C${tweenX1} ${tweenY1}, ${tweenX2} ${tweenY2}, 110 ${i}" />`
  }

  draw() {
    const paths = []
    for (let i = -CROP; i < 100 + CROP; i += this.pitch) {
      if (this.order === 0) {
        paths.push(this.getLinear(i))
      } else if (this.order === 1) {
        paths.push(this.getQuadratic(i))
      } else if (this.order === 2) {
        paths.push(this.getCubic(i))
      }
    }

    this.$root.html(paths.join(''))
    for (let i = 0; i < this.order; i++) {
      paths.push(`<circle cx="${this.beg[i][0]}" cy="${this.beg[i][1]}" r="2" fill="green" />`)
      paths.push(`<circle cx="${this.end[i][0]}" cy="${this.end[i][1]}" r="2" fill="red" />`)
    }
    paths.push('<circle cx="50" cy="50" r="51" fill="none" stroke="#888" stroke-width="0.5" />')
    this.$refSvg.html(paths.join(''))
  }
}

const back = new Designer($patternb, $back)
const face = new Designer($pattern, $face, [[-20, -20], [20, -20]])

face.draw()
back.draw()
location.hash = back.toString() + ';' + face.toString()

console.log(location.hash)
