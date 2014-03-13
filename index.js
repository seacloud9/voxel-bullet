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
    if (opts.mesh == undefined) opts.mesh = new game.THREE.SphereGeometry(2, 4, 4);
    if (opts.material == undefined) opts.material = new game.THREE.MeshLambertMaterial({
        color: 0x7C0400,
        ambient: 0x660000
    });
    if (opts.speed == undefined) opts.speed = 0.25;
    if (opts.spriteMaterial == undefined) opts.spriteMaterial = new game.THREE.SpriteMaterial({
        map: new game.THREE.ImageUtils.loadTexture('images/glow.png'),
        useScreenCoordinates: false,
        alignment: game.THREE.SpriteAlignment.center,
        color: 0xff1a00,
        transparent: false,
        blending: game.THREE.AdditiveBlending
    });
    if (opts.sprite == undefined) opts.sprite = new game.THREE.Sprite(opts.spriteMaterial);
    opts.sprite.scale.set(8, 8, 1.0);
    this.spriteMaterial = opts.spriteMaterial;
    this.sprite = opts.sprite;
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
    if (opts.collisionRadius === undefined) opts.collisionRadius = 10;
    if (opts.interval === undefined) opts.interval = 1000;
    if (opts.damage == undefined) this.damage = 5;
    if (opts.owner == undefined) this.owner = this.type[1];
    for (var i = 0; i < opts.count; i++) {
        this.local[i] = new game.THREE.Mesh(this.mesh, this.material);
        this.local[i].position.set(opts.bulletPosition[i].x, opts.bulletPosition[i].y, opts.bulletPosition[i].z);
        this.local[i].useQuaternion = true;
        //this.local[i].add(this.sprite);
    }
    if (this.owner) {
        if (camera == undefined) return console.log('player requires a camera. ');
        this.pro.unprojectVector(opts.rootVector, camera);
        var ray = new game.THREE.Ray(opts.rootPosition, opts.rootVector.sub(opts.rootPosition).normalize());
        for (var i = 0; i < opts.count; i++) {
            this.local[i].ray = ray;
        }
    } else {
        //this.pro.unprojectVector(opts.rootVector, camera);
        var ray = new game.THREE.Ray(opts.rootPosition, opts.rootVector.sub(opts.rootPosition).normalize());
        for (var i = 0; i < opts.count; i++) {
            this.local[i].ray = ray;
        }
        //console.log(this);
    }
    var events = require('events');

    for (var i = 0; i < opts.count; i++) {
        this.local[i].owner = this.owner;
        var _bT = {};
        _bT.collisionRadius = opts.collisionRadius;
        _bT.mesh = this.local[i];
        _bT.id = this.live.length;
        _bT.owner = this.owner;
        _bT.damage = this.damage;
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
            try {
                var sefl = this;
                if (!opts) opts = {};
                if (opts.radius === undefined) opts.radius = 200;
                if (opts.collisionRadius === undefined) opts.collisionRadius = 500;
                if (opts.interval === undefined) opts.interval = 50;
                var pos = target.position || target;
                return setInterval(function() {
                    try {
                        var dist = sefl.mesh.position.distanceTo(pos);
                        if (dist < sefl.collisionRadius) {
                            sefl._event.emit('collide', target);
                        }
                    } catch (e) {}

                }, opts.interval);
            } catch (e) {}

        }

        _bT.Destory = function() {
            _bT._events = null;
            _bT._event = null;
            delete _bT;
        }

        if (opts.target != undefined) {
            for (var x = 0; x < opts.target.length; x++) {
                var cTarget = opts.target[x];
                // console.log(cTarget);
                _bT.notice(cTarget, {
                    radius: 500
                });
                _bT._event.on('collide', function(cTarget) {
                    try {
                        //console.log('collideX');
                        if (!_bT.owner && _initGame) {
                            //console.log(_bT.owner)
                            player.health -= _bT.damage;
                            healtHit(1.0 - (player.health / 100));
                            _bT.mesh.visible = false;
                        }
                        game.scene.remove(_bT);
                        game.score += cTarget.Explode();
                        delete cTarget;
                        delete _bT;
                    } catch (e) {
                        //console.log(e)
                    }

                });
            }
        }
        this.live.push(_bT);
        game.scene.add(_bT);
    }



    return this.live;

}