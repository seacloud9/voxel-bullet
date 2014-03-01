var inherits = require('inherits');
var EventEmitter = require('events').EventEmitter;

module.exports = function(game) {
    return function(opts) {
        return new Bullet(game, opts || {});
    };
};
inherits(Bullet, EventEmitter);
module.exports.Bullet = Bullet;

function Bullet(game, opts) {
    this.game = game;
    if (!opts) opts = {};
    if (opts.mesh == undefined) opts.mesh = new game.THREE.SphereGeometry(2, 6, 6);
    if (opts.material == undefined) opts.material = new game.THREE.MeshBasicMaterial({
        color: 0xffffff
    });
    if (opts.speed == undefined) opts.speed = 0.25;
    this.speed = opts.speed;
    this.mesh = opts.mesh;
    this.material = opts.material;

    this.live = [];
    this.local = [];

    this.type = ['enemy', 'player'];
}

Bullet.prototype.BuildBullets = function(opts, camera) {
    this.pro = new game.THREE.Projector();
    if (!opts) opts = {};
    if (opts.count == undefined) opts.count = 1;
    if (opts.rootVector == undefined) opts.rootVector = new game.THREE.Vector3(1, 1, 1);
    if (opts.rootPosition == undefined) opts.rootPosition = new game.THREE.Vector3(1, 1, 1);
    if (opts.bulletPosition == undefined) opts.bulletPosition = [new game.THREE.Vector3(1, 1, 1)];
    if (opts.radius === undefined) opts.radius = 50;
    if (opts.collisionRadius === undefined) opts.collisionRadius = 2;
    if (opts.interval === undefined) opts.interval = 1000;
    if (opts.owner == undefined) this.owner = this.type[1];
    for (var i = 0; i < opts.count; i++) {
        this.local[i] = new game.THREE.Mesh(this.mesh, this.material);
        this.local[i].position.set(opts.bulletPosition[i].x, opts.bulletPosition[i].y, opts.bulletPosition[i].z);
        this.local[i].useQuaternion = true;
    }
    if (this.owner) {
        if (camera == undefined) return console.log('player requires a camera. ');
        this.pro.unprojectVector(opts.rootVector, camera);
        var ray = new game.THREE.Ray(opts.rootPosition, opts.rootVector.sub(opts.rootPosition).normalize());
        for (var i = 0; i < opts.count; i++) {
            this.local[i].ray = ray;
        }
    } else {

    }
    var events = require('events');

    for (var i = 0; i < opts.count; i++) {
        this.local[i].owner = this.owner;
        var _bT = {};
        _bT.collisionRadius = opts.collisionRadius;
        _bT.mesh = this.local[i];
        _bT._event = new events.EventEmitter();
        _bT._events = _bT._event._events;
        _bT.game = game;
        _bT.size = this.game.cubeSize;
        _bT.velocity = {
            x: 0,
            y: 0,
            z: 0
        };
        _bT.item = game.addItem(_bT);
        _bT.notice = function(target, opts) {
            var sefl = this;
            if (!opts) opts = {};
            if (opts.radius === undefined) opts.radius = 200;
            if (opts.collisionRadius === undefined) opts.collisionRadius = 100;
            if (opts.interval === undefined) opts.interval = 2;
            var pos = target.position || target;
            return setInterval(function() {
                var dist = sefl.mesh.position.distanceTo(pos);
                if (dist < sefl.collisionRadius) {
                    sefl._event.emit('collide', target);
                }
            }, opts.interval);
        }

        if (opts.target != undefined) {
            for (var x = 0; x < opts.target.length; x++) {
                var cTarget = opts.target[x];
                _bT.notice(cTarget, {
                    radius: 500
                });
                _bT._event.on('collide', function(cTarget) {
                    console.log('collideX')
                    game.scene.remove(cTarget.item.avatar);
                });
            }
        }
        this.live.push(_bT);
        game.scene.add(_bT);
    }


    return this.local;

}