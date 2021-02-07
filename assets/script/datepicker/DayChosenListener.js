cc.Class({
    extends: cc.Component,

    // use this for initialization
    onLoad: function () {
        cc.director.getCollisionManager().enabled = true;
        this.node.anchorX = 0.5;
    },
    
    onCollisionEnter: function (other) {
        // 把当前元素置黑
        this.node.getComponent(cc.Label).fontSize = 36;
        this.picker.day = parseInt(this.node.getComponent(cc.Label).string);
        this.node.opacity = 255;
    },
    
    onCollisionExit: function () {
        this.node.getComponent(cc.Label).fontSize = 30;
        this.node.opacity = 100;
    }
});
