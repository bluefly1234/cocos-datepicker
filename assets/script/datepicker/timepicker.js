cc.Class({
  extends: cc.Component,

  properties: {
    player_info_prefab: {
      default: null,
      type: cc.Prefab
    },
    yearScrollview: {
      default: null,
      type: cc.ScrollView
    },
    monthScrollview: {
      default: null,
      type: cc.ScrollView
    },
    dayScrollview: {
      default: null,
      type: cc.ScrollView
    },
    timeWrapNode:{
      default: null,
      type: cc.Node
    }
  },

  onLoad() {
    var player_info = cc.instantiate(this.player_info_prefab);
    this.maxYear = new Date().getFullYear() // 今年
    this.maxMonth = new Date().getMonth() + 1 // 今月
    this.maxDay =  new Date().getDate()// 今日
    this.chooseYear = '' // 当前选择的年
    this.chooseMonth = '' // 当前选择的月
    this.chooseDay = '' // 当前选择的日
    this.yearArray = []
    this.monthArray = []
    this.dayArray = []
    //2015-01-01
    this.currentYear = 2015
    this.currentMonth = 1
    this.currentDay = 1
    this.timeWrapH = this.timeWrapNode.height
    this.prefabH = player_info.height
    this.initTimePicker()
  
  },
  initTimePicker() {
    this.initTimePickerData()
    this.initTimePickerScrollHandler()
    this.toAppointPosition(this.currentYear, this.currentMonth, this.currentDay)
  },
  initTimePickerData() {
    this.initYearItemData()
    this.initMonthItemData()
    this.initDayItemData()
  },
  toAppointPosition(yearPos, monthPos, dayPos) {
    var yearIndex = this.getDateIndex(this.yearArray, yearPos)
    this.yearScrollview.content._children[yearIndex + 1]._children[0].color = new cc.color(30,74,109)
    this.yearScrollview.setContentPosition(cc.v2(0, yearIndex  * this.prefabH + this.timeWrapH/2))

    var monthIndex = this.getDateIndex(this.monthArray, monthPos)
    this.monthScrollview.content._children[monthIndex + 1]._children[0].color = new cc.color(30,74,109)
    this.monthScrollview.setContentPosition(cc.v2(0,monthIndex  * this.prefabH + this.timeWrapH/2))

    var dayIndex = this.getDateIndex(this.dayArray, dayPos)
    this.dayScrollview.content._children[dayIndex + 1]._children[0].color = new cc.color(30,74,109)
    this.dayScrollview.setContentPosition(cc.v2(0, dayIndex  * this.prefabH + this.timeWrapH/2))
  },
  initTimePickerScrollHandler() {
    this.yearScrollview.node.on('scroll-ended', this.yearScrollEnd.bind(this), this);
    this.monthScrollview.node.on('scroll-ended', this.monthScrollEnd.bind(this), this);
    this.dayScrollview.node.on('scroll-ended', this.dayScrollEnd.bind(this), this);
    var checkMouseWheel = function(dt) {
      var currentOutOfBoundary = this._getHowMuchOutOfBoundary();
      var maxElapsedTime = 0.1;

      if (!cc.pFuzzyEqual(currentOutOfBoundary, cc.p(0, 0), EPSILON)) {
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

      this.yearScrollview._checkMouseWheel = checkMouseWheel;
      this.monthScrollview._checkMouseWheel = checkMouseWheel;
      this.dayScrollview._checkMouseWheel = checkMouseWheel;

      this.yearScrollview._onMouseWheel = () => {};
      this.monthScrollview._onMouseWheel = () => {};
      this.dayScrollview._onMouseWheel = () => {};
  },
  initYearItemData() {
    var currentYear = this.maxYear
    // 需求是10年间
    var startYear = 1999
    var yearDuration = currentYear - startYear
    this.initDom(yearDuration,'yearArray',this.yearScrollview,startYear)
  },
  initMonthItemData() {
    this.initDom(12,'monthArray',this.monthScrollview,0)
  },
  initDayItemData() {
    var dayLength = this.getDayNums(this.currentYear, this.currentMonth)
    this.initDom(dayLength,'dayArray',this.dayScrollview,0)
  },
  yearScrollEnd(event) {
    var pos = event.getContentPosition();
    var currentIndex,lastIndex
    var lastYear = this.currentYear
    this.lastMonth = this.currentMonth
    currentIndex = Math.round((pos.y - ( this.timeWrapH/2 - this.prefabH )) / this.prefabH)
    lastIndex = this.getDateIndex(this.yearArray,lastYear) + 1
    this.currentYear = this.yearArray[currentIndex - 1]
    this.refreshMonth(this.currentYear,lastYear)
    this.yearScrollview.content._children[lastIndex]._children[0].color = new cc.color(231,234,237)
    this.yearScrollview.content._children[currentIndex]._children[0].color = new cc.color(30,74,109)

    event.setContentPosition(cc.v2(0, (currentIndex - 1) * this.prefabH + this.timeWrapH/2));
  },
  monthScrollEnd(event) {
    var pos = event.getContentPosition();
    var currentIndex,lastIndex
    var _lastMonth = this.currentMonth
    this.lastMonth = _lastMonth

    currentIndex = Math.round((pos.y - ( this.timeWrapH/2 - this.prefabH )) / this.prefabH)
    lastIndex = this.getDateIndex(this.monthArray,this.lastMonth) + 1
    this.currentMonth = this.monthArray[currentIndex - 1]
    this.refreshDay(this.currentMonth, this.lastMonth,this.currentYear)
    this.lastMonth = this.currentMonth

    this.monthScrollview.content._children[lastIndex]._children[0].color = new cc.color(231,234,237)
    this.monthScrollview.content._children[currentIndex]._children[0].color = new cc.color(30,74,109)

    event.setContentPosition(cc.v2(0, (currentIndex-1) * this.prefabH + this.timeWrapH/2));
  },
  dayScrollEnd(event) {
    var pos = event.getContentPosition();
    var currentIndex,lastIndex
    var lastDay = this.currentDay

    lastIndex = this.getDateIndex(this.dayArray,lastDay) + 1
    currentIndex = Math.round((pos.y - ( this.timeWrapH/2 - this.prefabH )) / this.prefabH)
    this.currentDay = this.dayArray[currentIndex - 1]

    this.dayScrollview.content._children[lastIndex]._children[0].color = new cc.color(231,234,237)
    this.dayScrollview.content._children[currentIndex]._children[0].color = new cc.color(30,74,109)
    event.setContentPosition(cc.v2(0, (currentIndex-1) * this.prefabH + this.timeWrapH/2));
  },
  refreshMonth(currentYear,lastYear){
    var currentYearMonthsLength = this.maxMonth
    if(currentYear === lastYear) return
    if(this.currentYear !== this.maxYear ){
      if(lastYear === this.maxYear){
        //add mon
        if(this.lastMonth === undefined){
          this.lastMonth = this.currentMonth
        }
        this.updateArray('monthArray',12)
        this.updateCurrentDate(this.currentMonth,this.monthArray)
        this.addDom(this.monthScrollview,currentYearMonthsLength,12)
        var currentDayLen = this.getDayNums(currentYear,this.currentMonth)
        var lastDayLen = this.getDayNums(lastYear,this.lastMonth)
        if(currentDayLen !== lastDayLen){
          this.refreshDay(this.lastMonth,this.currentMonth,lastYear)
          this.lastMonth = this.currentMonth
        }
      }
      if(currentYear !== this.maxYear && lastYear !== this.maxYear){
        this.refreshDay(this.currentMonth,this.currentMonth,lastYear)
        this.lastMonth = this.currentMonth
      }
    }else if(this.maxMonth < 12){
      if(currentYear === this.maxYear){
        //del mon
        this.updateArray('monthArray',currentYearMonthsLength)
        this.updateCurrentDate(this.currentMonth,this.monthArray)
        this.delDom(this.monthScrollview,currentYearMonthsLength,12)
        if(this.currentMonth >= this.maxMonth){
          this.monthScrollview.content._children[this.maxMonth]._children[0].color = new cc.color(30,74,109)
          this.currentMonth = this.maxMonth
          if(this.getDayNums(lastYear,this.currentYear) !== this.maxDay){
            this.refreshDay(this.maxMonth,this.lastMonth,lastYear)
            this.lastMonth = this.currentMonth
            return
          }
        }
       
        if(
          this.isLeapYear(lastYear) !== this.isLeapYear(this.currentYear) &&
          this.currentMonth === 2){
            this.refreshDay(this.currentMonth,this.currentMonth,lastYear)
            this.lastMonth = this.currentMonth
          }
      }
      if(lastYear === this.maxYear){
        //add mon
        if(this.lastMonth === undefined){
          this.lastMonth = this.currentMonth
        }
        this.updateArray('monthArray',12)
        this.updateCurrentDate(this.currentMonth,this.monthArray)
        this.addDom(this.monthScrollview,currentYearMonthsLength,12)
        var currentDayLen = this.getDayNums(currentYear,this.currentMonth)
        var lastDayLen = this.getDayNums(lastYear,this.lastMonth)
        if(currentDayLen !== lastDayLen){
          this.refreshDay(this.currentMonth,this.lastMonth,lastYear)
          this.lastMonth = this.currentMonth
        }
      }
    }
  },
  refreshDay(curMon, lastMon,lastYear) {
    var DAY_NUMS = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
    var curDayLen,lastDayLen

    if(curMon === 2 && this.isLeapYear(this.currentYear)){
        curDayLen = 29
    } else {
      curDayLen = DAY_NUMS[curMon-1]
    }
    if(curMon == this.maxMonth && this.currentYear == this.maxYear){
      curDayLen = this.maxDay
    }
    if(lastMon === 2 && lastYear && this.isLeapYear(lastYear)){
        lastDayLen = 29
    } else {
      lastDayLen = DAY_NUMS[lastMon-1]
    }
    if(lastMon == this.maxMonth && lastYear == this.maxYear){
      lastDayLen = this.maxDay
    }
 
    if(curDayLen === lastDayLen) return
    if(curDayLen<lastDayLen){
      this.updateArray('dayArray',curDayLen)
      this.updateCurrentDate(this.currentMonth,this.monthArray)
      this.delDom(this.dayScrollview,curDayLen,lastDayLen)
      if(this.currentDay > curDayLen){
        this.currentDay = curDayLen
        this.dayScrollview.content._children[this.currentDay]._children[0].color = new cc.color(30,74,109)
      }
    } else {
      this.updateArray('dayArray',curDayLen)
      this.updateCurrentDate(this.currentMonth,this.monthArray)
      this.addDom(this.dayScrollview,lastDayLen,curDayLen)
      this.dayScrollview.content._children[this.currentMonth]._children[0].color = new cc.color(231,234,237)
      this.dayScrollview.content._children[this.currentDay]._children[0].color = new cc.color(30,74,109)
    }
    
  },
  getDateIndex(array, currentDate) {
    for (var i = 0; i < array.length; i++) {
      if (array[i] == currentDate) {
        return i
      }
    }
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
  getDayNums(year, mon) {
    const DAY_NUMS = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
    if (mon == 2 && this.isLeapYear(year)) {
      return 29;
    } else if(year === this.maxYear && mon === this.maxMonth){
      return this.maxDay
    } else {
      return DAY_NUMS[mon - 1];
    }
    
  },
  delDom(scrollview,startIndex,length){
    if(startIndex === scrollview.content._children.length - 2) return
    for (let i = length-startIndex; i > 0; --i) {
      var node = scrollview.content.children[startIndex+1]
      node.removeFromParent()
    }
  },
  addDom(scrollview,startIndex,length){
    let node =  scrollview.content.children[startIndex + 1]
    if(node === undefined) return 
    scrollview.content.children[startIndex + 1].removeFromParent()
    
    for (let i = startIndex + 1; i <= length+1; i++) {
      var player_info = cc.instantiate(this.player_info_prefab);
      if(i === length+1){
        player_info.children[0]['_components'][0]['string'] = ''
      }else{
        player_info.children[0]['_components'][0]['string'] = i  > 9 ? i  : '0' + i ;
      }
      scrollview.content.addChild(player_info);
    }
   
  },
  initDom(maxLen,dateArray,scrollContent,startDate){
    var _temArray = []
    for (var i = 0; i <= maxLen + 1; i++) {
      var player_info = cc.instantiate(this.player_info_prefab);
      if (i == 0 || i == maxLen + 1) {
        player_info.children[0]['_components'][0]['string'] = ''
      } else {
        player_info.children[0]['_components'][0]['string'] = i + startDate > 9 ? i + startDate : '0' + i ; 
        _temArray.push(i + startDate)
      }
      scrollContent.content.addChild(player_info);
    }
    this[dateArray] = _temArray
  },
  updateArray(oldArray,length){
    var tempArr = []
    for(var i=1;i<=length;i++){
      tempArr.push(i)
    }
    this[oldArray] = tempArr
  },
  updateCurrentDate(date,array){
    if(date>=array.length){
      date = array.length
    }
  },
  getValue(){
   return `${this.currentYear}-${this.currentMonth}-${this.currentDay}`
  }
});


