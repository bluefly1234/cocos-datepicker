
cc.Class({
    extends: cc.Component,
    
    properties: {
    },
    
    // use this for initialization
    onLoad: function () {
        cc.director.getCollisionManager().enabled = true;
        this.node.anchorX = 0.5;
    },
    
    onCollisionEnter: function (other) {
        // 把当前元素置黑
        this.node.getComponent(cc.Label).fontSize = 36;
        this.picker.mon = parseInt(this.node.getComponent(cc.Label).string);
        this.node.opacity = 255;
        if (!this.picker.forbidMonthRefresh) {
            if (this.picker.year < this.picker.maxYear || this.picker.mon < this.picker.maxMon) {
                let mon = this.picker.mon;
                this.picker.refreshDays(this.picker.getDayNums(this.picker.year, mon));
            } else {
                this.picker.refreshDays(this.picker.maxDay);
            }
        }
    },

    onCollisionExit: function () {
        this.node.getComponent(cc.Label).fontSize = 30;
        this.node.opacity = 76.5;
    }
});
