
cc.Class({
    extends: cc.Component,

    properties: {
    },

    // use this for initialization
    onLoad: function () {
        cc.director.getCollisionManager().enabled = true;
        // cc.director.getCollisionManager().enabledDebugDraw = true;
        this.node.anchorX = 0.5;
    },
    
    onCollisionEnter: function (other) {
        // 把当前元素置黑
        this.node.getComponent(cc.Label).fontSize = 36;
        this.picker.year = parseInt(this.node.getComponent(cc.Label).string);
        this.node.opacity = 255;
        this.picker.forbidMonthRefresh = true;
        if (this.picker.year < this.picker.maxYear) {
            // 放开全部可选
            this.picker.refreshMons(12);
            let mon = this.picker.mon;
            this.picker.refreshDays(this.picker.getDayNums(this.picker.year, mon));
        } else {
            this.picker.refreshMons(this.picker.maxMon);
            let mon = this.picker.mon;
            if (mon < this.picker.maxMon) {
                // 当前月份小于最大月份
                this.picker.refreshDays(this.picker.getDayNums(this.picker.year, mon));
            } else {
                // 当前月份大于或等于于最大月份
                //this.picker.refreshDays(this.picker.getDayNums(this.picker.year, mon));
                this.picker.refreshDays(this.picker.maxDay);
            }            
        }
        this.picker.forbidMonthRefresh = false;
    },
    
    onCollisionExit: function () {
        this.node.getComponent(cc.Label).fontSize = 30;
        this.node.opacity = 76.5;
    }
});
