/**
 * 通用的时间选择器组件
 */
let G_DATEPICKER;
let G_MAX_YEAR; // 今年
let G_MAX_MON; // 今月
let G_MAX_DAY; // 今日
let G_CHOSEN_YEAR; // 当前选择的年
let G_CHOSEN_MON; // 当前选择的月
let G_CHOSEN_DAY; // 当前选择的日
// let G_RANGE;
let G_TAG;
let G_START_YEAR = 2000
const G_PADDING_TOP = 90;

var EPSILON = 1e-4;

cc.Class({
  extends: cc.Component,

  properties: {
    yearColumn: {
      default: null,
      type: cc.ScrollView,
    },
    monColumn: {
      default: null,
      type: cc.ScrollView,
    },
    dayColumn: {
      default: null,
      type: cc.ScrollView,
    },
    yearLayout: {
      default: null,
      type: cc.Node,
    },
    monLayout: {
      default: null,
      type: cc.Node,
    },
    dayLayout: {
      default: null,
      type: cc.Node,
    },
    yearPrefab: {
      default: null,
      type: cc.Prefab
    },
    monPrefab: {
      default: null,
      type: cc.Prefab
    },
    dayPrefab: {
      default: null,
      type: cc.Prefab
    },
    maxYear: -1,
    maxMon: -1,
    maxDay: -1,
    years: [],
    year: -1,
    mons: [],
    mon: -1,
    days: [],
    day: -1,
    forbidMonthRefresh: false // 当滚动年份时，禁止触发月份的主动刷新
  },

  // 添加年
  addYears: function (max) {
    this.years = [];
    // 添加新内容
    for (let year = G_START_YEAR; year <= max; ++year) {
      let item = cc.instantiate(this.yearPrefab);
      item.getComponent('YearChosenListener').picker = this;
      item.getComponent(cc.Label).string = '' + year;
      this.yearLayout.addChild(item);
      this.years.push(year);
    }
  },

  // 添加月
  addMons: function () {
    // 清空原来的内容
    this.mons = [];
    // 添加新内容
    let startMon = 1;
    for (let mon = startMon; mon <= 12; ++mon) {
      let item = cc.instantiate(this.monPrefab);
      item.getComponent('MonChosenListener').picker = this;
      item.getComponent(cc.Label).string = mon > 9 ? '' + mon : '0' + mon;
      this.monLayout.addChild(item);
      this.mons.push(mon);
    }
  },

  // 刷新月
  refreshMons: function (max) {
    // 清空原来的内容        
    if (max < 1) {
      return;
    }
    let monLength = this.monLayout.children.length;
    if (monLength <= 0) return;
    let lastMon = parseInt(this.monLayout.children[monLength - 1].getComponent(cc.Label).string);
    if (max > lastMon) {
      // 需要添加元素
      for (let mon = lastMon + 1; mon <= max; ++mon) {
        let item = cc.instantiate(this.monPrefab);
        item.getComponent('MonChosenListener').picker = this;
        item.getComponent(cc.Label).string = mon > 9 ? '' + mon : '0' + mon;
        this.monLayout.addChild(item);
      }
    } else if (max < lastMon) {
      // 需要删除元素
      for (let i = lastMon; i > max; --i) {
        let node = this.monLayout.children[i - 1];
        node.removeFromParent();
      }
    }
    if (max < this.mon) {
      this.monScrollTask && clearTimeout(this.monScrollTask);
      this.monScrollTask = setTimeout(() => {
        this.monColumn._scrollToChild && this.monColumn._scrollToChild.call(this.monColumn, max);
      }, 10);
    }
  },

  // 添加日
  addDays: function () {
    // 清空原来的内容
    this.days = [];
    // 添加新的内容
    let startDay = 1;
    for (let day = startDay; day <= 31; ++day) {
      let item = cc.instantiate(this.dayPrefab);
      item.getComponent('DayChosenListener').picker = this;
      item.getComponent(cc.Label).string = day > 9 ? '' + day : '0' + day;
      this.dayLayout.addChild(item);
      this.days.push(day);
    }
  },


  // 添加日
  refreshDays: function (max) {
    if (max < 1) {
      return;
    }
    let dayLength = this.dayLayout.children.length;
    if (dayLength <= 0) return;
    let lastDay = parseInt(this.dayLayout.children[dayLength - 1].getComponent(cc.Label).string);
    if (max > lastDay) {
      // 需要添加元素
      for (let day = lastDay + 1; day <= max; ++day) {
        let item = cc.instantiate(this.dayPrefab);
        item.getComponent('DayChosenListener').picker = this;
        item.getComponent(cc.Label).string = day > 9 ? '' + day : '0' + day;
        this.dayLayout.addChild(item);
      }
    } else if (max < lastDay) {
      // 需要删除元素
      for (let i = lastDay; i > max; --i) {
        let node = this.dayLayout.children[i - 1];
        node.removeFromParent();
      }
    }

    if (max < this.day) {
      this.dayScrollTask && clearTimeout(this.dayScrollTask);
      this.dayScrollTask = setTimeout(() => {
        this.dayColumn._scrollToChild && this.dayColumn._scrollToChild.call(this.dayColumn, max);
      }, 10);
    }
  },


  addContent: function () {
    var _this = this;
    // 添加可选的年月日        

    this.addYears(G_MAX_YEAR);
    this.addMons();
    this.addDays();

    let yearIdx = this.years.indexOf(G_CHOSEN_YEAR);
    let monIdx = this.mons.indexOf(G_CHOSEN_MON);
    let dayIdx = this.days.indexOf(G_CHOSEN_DAY);

    //如果日期不合法设为当前日期  
    if (yearIdx == -1 || monIdx == -1 || dayIdx == -1) {
      yearIdx = this.years.indexOf(G_MAX_YEAR);
      monIdx = this.mons.indexOf(G_MAX_MON);
      dayIdx = this.days.indexOf(G_MAX_DAY);
    }

    this.yearLayout.opacity = 0;
    this.monLayout.opacity = 0;
    this.dayLayout.opacity = 0;

    setTimeout(() => {
      let curYearNode = _this.yearLayout.children[yearIdx];
      let yearOffset = Math.abs(curYearNode.y) - G_PADDING_TOP;
      _this.yearColumn.scrollToOffset(cc.v2(0, yearOffset - 10), 0);

      let curMonNode = _this.monLayout.children[monIdx];
      let monOffset = Math.abs(curMonNode.y) - G_PADDING_TOP;
      _this.monColumn.scrollToOffset(cc.v2(0, monOffset - 10), 0);

      let curDayNode = _this.dayLayout.children[dayIdx];
      let dayOffset = Math.abs(curDayNode.y) - G_PADDING_TOP;
      _this.dayColumn.scrollToOffset(cc.v2(0, dayOffset - 10), 0);
    }, 0);
    this.yearLayout.runAction(cc.fadeIn(0.5));
    this.monLayout.runAction(cc.fadeIn(0.5));
    this.dayLayout.runAction(cc.fadeIn(0.5));
  },

  /**
   * 判断闰年
   */
  isLeapYear: function (year) {
    return (0 == year % 4 && ((year % 100 != 0) || (year % 400 == 0)));
  },

  /**
   * 获取一个月的天数
   * @param mon 
   */
  getDayNums: function (year, mon) {
    const DAY_NUMS = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
    if (mon < 0 || mon > 12) {
      // cc.warn(G_TAG, "错误的月份: " + mon);
      return -1;
    }
    if (mon == 2 && this.isLeapYear(year)) {
      return 29;
    } else {
      return DAY_NUMS[mon - 1];
    }
  },

  getChosenValue: function () {
    console.log('getChosenValue');
    let _this = this;
    let yearLength = this.yearColumn.content._children.length;
    let monLength = this.monColumn.content._children.length;
    let dayLength = this.dayColumn.content._children.length;
    let year = -1;
    let mon = -1;
    let day = -1;
    for (let i = 0; i < yearLength; ++i) {
      let node = _this.yearColumn.content._children[i];
      if (node.opacity == 255) {
        year = node.getComponent(cc.Label).string;
        break;
      }
    }
    for (let i = 0; i < monLength; ++i) {
      let node = _this.monColumn.content._children[i];
      if (node.opacity == 255) {
        mon = node.getComponent(cc.Label).string;
        break;
      }
    }
    for (let i = 0; i < dayLength; ++i) {
      let node = _this.dayColumn.content._children[i];
      if (node.opacity == 255) {
        day = node.getComponent(cc.Label).string;
        break;
      }
    }
    return `${year}-${mon}-${day}`;
  },

  onLoad: function () {
    var _this = this;

    let myDate = new Date();

    let chosen = '2015/01/01';
    window.datePicker = this

    G_CHOSEN_YEAR = chosen ? parseInt(chosen.split(/[-/:]/)[0]) : parseInt(myDate.getFullYear());
    G_CHOSEN_MON = chosen ? parseInt(chosen.split(/[-/:]/)[1]) : parseInt(myDate.getMonth()) + 1;
    G_CHOSEN_DAY = chosen ? parseInt(chosen.split(/[-/:]/)[2]) : parseInt(myDate.getDate());

    G_MAX_YEAR = parseInt(myDate.getFullYear());
    G_MAX_MON = parseInt(myDate.getMonth()) + 1;
    G_MAX_DAY = parseInt(myDate.getDate());

    this.maxYear = G_MAX_YEAR;
    this.maxMon = G_MAX_MON;
    this.maxDay = G_MAX_DAY;

    // 添加元素
    this.addContent();

    var scrollToChild = function (index) {
      var {
        childrenCount,
        height: contentHeight
      } = this.content;
      var {
        spacingY,
        paddingTop,
        paddingBottom,
      } = this.content.getComponent(cc.Layout);
      var itemHeight = (contentHeight - paddingTop - paddingBottom - Math.max(0, (childrenCount - 1)) * spacingY) / childrenCount;
      var targetY = (spacingY + itemHeight) * index ;
      this.scrollToOffset(cc.v2(0, targetY), 0.5);
    };

    this.yearColumn._scrollToChild = scrollToChild;
    this.monColumn._scrollToChild = scrollToChild;
    this.dayColumn._scrollToChild = scrollToChild;

    var scrollToClosestChild = function () {
      var {
        y: positionY
      } = this.getContentPosition();
      var {
        childrenCount,
        height: contentHeight
      } = this.content;
      var {
        spacingY,
        paddingTop,
        paddingBottom
      } = this.content.getComponent(cc.Layout);
      var itemHeight = (contentHeight - paddingTop - paddingBottom - Math.max(0, (childrenCount - 1)) * spacingY) / childrenCount;
      var index = Math.round(positionY / (spacingY + itemHeight));
      index = Math.max(0, index)
      index = Math.min(childrenCount - 1, index)
      this.scrollToOffset(cc.v2(0, index * (spacingY + itemHeight)), 0.3);
    };
    this.yearColumn._scrollToClosestChild = scrollToClosestChild;
    this.monColumn._scrollToClosestChild = scrollToClosestChild;
    this.dayColumn._scrollToClosestChild = scrollToClosestChild;


    var scrollOne = function (velocity) {
      var {
        y: positionY
      } = this.getContentPosition();
      var {
        childrenCount,
        height: contentHeight
      } = this.content;
      var {
        spacingY,
        paddingTop,
        paddingBottom
      } = this.content.getComponent(cc.Layout);
      var itemHeight = (contentHeight - paddingTop - paddingBottom - Math.max(0, (childrenCount - 1)) * spacingY) / childrenCount;
      var index = Math.round(positionY / (spacingY + itemHeight));
      var offsetY;
      if (velocity < 0) {} else {
        index++
      }
      index = Math.max(0, index)
      index = Math.min(childrenCount - 1, index)
      this.scrollToOffset(cc.v2(0, index * (spacingY + itemHeight)), 0.3);
    };


    this.yearColumn._scrollOne = scrollOne;
    this.monColumn._scrollOne = scrollOne;
    this.dayColumn._scrollOne = scrollOne;

    var handleReleaseLogic = function (touch) {
      var delta = touch.getDelta();
      this._gatherTouchMove(delta);
      var bounceBackStarted = this._startBounceBackIfNeeded();
      if (!bounceBackStarted && this.inertia) {
        var touchMoveVelocity = this._calculateTouchMoveVelocity();
        if (Math.abs(touchMoveVelocity.y) > 500 && this.brake < 1) {
          this._startInertiaScroll(touchMoveVelocity);
        } else {
          if (Math.abs(touchMoveVelocity.y) < 100) {
            this._scrollToClosestChild && this._scrollToClosestChild.call(this);
          } else {
            this._scrollOne && this._scrollOne.call(this, touchMoveVelocity.y);
          }
        }
      }
      this._onScrollBarTouchEnded();
    };

    this.dayColumn._handleReleaseLogic = handleReleaseLogic;
    this.monColumn._handleReleaseLogic = handleReleaseLogic;
    this.yearColumn._handleReleaseLogic = handleReleaseLogic;

    var startAutoScroll = function (deltaMove, timeInSecond, attenuated) {

      timeInSecond *= 0.8;

      var adjustedDeltaMove = this._flattenVectorByDirection(deltaMove);
      var start = this.getContentPosition();
      var predictedEnd = start.add(adjustedDeltaMove);

      var {
        childrenCount,
        height: contentHeight
      } = this.content;
      var {
        spacingY,
        paddingTop,
        paddingBottom,
        cellSize: {
          height: cellHeight
        }
      } = this.content.getComponent(cc.Layout);

      var itemHeight = (contentHeight - paddingTop - paddingBottom - Math.max(0, (childrenCount - 1)) * spacingY) / childrenCount;

      var index = Math.round((predictedEnd.y ) / (spacingY + itemHeight));
      index = Math.min(index, childrenCount - 1);
      predictedEnd = cc.v2(start.x, (spacingY + itemHeight) * index );

      adjustedDeltaMove = predictedEnd.sub(start);

      this._autoScrolling = true;
      this._autoScrollTargetDelta = adjustedDeltaMove;
      this._autoScrollAttenuate = attenuated;
      this._autoScrollStartPosition = this.getContentPosition();
      this._autoScrollTotalTime = timeInSecond;
      this._autoScrollAccumulatedTime = 0;
      this._autoScrollBraking = false;
      this._isScrollEndedWithThresholdEventFired = false;
      this._autoScrollBrakingStartPosition = cc.v2(0, 0);

      var currentOutOfBoundary = this._getHowMuchOutOfBoundary();
      if (!currentOutOfBoundary.fuzzyEquals(cc.v2(0, 0), EPSILON)) {
        this._autoScrollCurrentlyOutOfBoundary = true;
        var afterOutOfBoundary = this._getHowMuchOutOfBoundary(adjustedDeltaMove);
        if (currentOutOfBoundary.x * afterOutOfBoundary.x > 0 ||
          currentOutOfBoundary.y * afterOutOfBoundary.y > 0) {
          this._autoScrollBraking = true;
        }
      }
    };

    this.yearColumn._startAutoScroll = startAutoScroll;
    this.monColumn._startAutoScroll = startAutoScroll;
    this.dayColumn._startAutoScroll = startAutoScroll;

    var checkMouseWheel = function (dt) {
      var currentOutOfBoundary = this._getHowMuchOutOfBoundary();
      var maxElapsedTime = 0.1;

      if (!currentOutOfBoundary.fuzzyEquals(cc.v2(0, 0), EPSILON)) {
        this._processInertiaScroll();
        this.unschedule(this._checkMouseWheel);
        this._stopMouseWheel = false;
        return;
      }

      this._mouseWheelEventElapsedTime += dt;

      //mouse wheel event is ended
      if (this._mouseWheelEventElapsedTime > maxElapsedTime) {
        this._onScrollBarTouchEnded();
        this.unschedule(this._checkMouseWheel);
        this._stopMouseWheel = false;
        this._scrollToClosestChild && this._scrollToClosestChild.call(this);
      }
    };

    this.yearColumn._checkMouseWheel = checkMouseWheel;
    this.monColumn._checkMouseWheel = checkMouseWheel;
    this.dayColumn._checkMouseWheel = checkMouseWheel;

    this.yearColumn._onMouseWheel = () => {};
    this.monColumn._onMouseWheel = () => {};
    this.dayColumn._onMouseWheel = () => {};

    this.yearColumn.elastic = false;
    this.monColumn.elastic = false;
    this.dayColumn.elastic = false;

  }
});