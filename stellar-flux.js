(function() {
    const container = document.body;

    const CONFIG = {
        starCount: 100,         // 星の総数（増やすと華やかですが負荷が上がります）
        minSpeed: 0.4,          // 星の最低速度（0より大きくすると止まりません）
        maxSpeed: 1.2,          // 星の最高速度
        minSize: 0.5,           // 星の最小サイズ（px）
        maxSize: 2.0,           // 星の最大サイズ（px）
        turnSpeedMin: 0.005,    // 進路変更の緩やかさ（小さいほど大回りになります）
        turnSpeedMax: 0.015,    // 進路変更の鋭さ（大きいほど急旋回します）
        changeIntervalMin: 4000,// 次の進路変更までの最短時間（ミリ秒）
        changeIntervalMax: 10000,// 次の進路変更までの最長時間（ミリ秒）
        saturation: 80,         // 色の鮮やかさ（0～100% / 0で白黒、100で鮮明）
        lightness: 85,          // 色の明るさ（0～100% / 100で真っ白）
        opacityMin: 0.2,        // 星の最小透明度（0.0 ～ 1.0）
        opacityMax: 0.8         // 星の最大透明度（0.0 ～ 1.0）
    };

    // Canvasの生成と初期設定
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    // スタイル設定：画面いっぱいに広げ、他のコンテンツの背面に固定する
    canvas.style.position = 'fixed';
    canvas.style.top = '0';
    canvas.style.left = '0';
    canvas.style.width = '100vw';
    canvas.style.height = '100vh';
    canvas.style.zIndex = '-1';          // コンテンツの裏側に配置
    canvas.style.pointerEvents = 'none'; // クリックなどのマウスイベントを無視（透過）
    canvas.style.display = 'block';

    container.appendChild(canvas);

    let width, height;
    // ブラウザのサイズ変更に合わせてCanvasサイズを更新する
    function resize() {
        width = canvas.width = window.innerWidth;
        height = canvas.height = window.innerHeight;
    }
    window.addEventListener('resize', resize);
    resize();

    /**
     * 各々の星を定義するクラス
     */
    class Star {
        constructor() {
            this.init();
        }

        // 初期パラメータの設定
        init() {
            this.x = Math.random() * width;
            this.y = Math.random() * height;
            
            // CONFIGに基づいた個体差の設定
            this.size = Math.random() * (CONFIG.maxSize - CONFIG.minSize) + CONFIG.minSize;
            this.alpha = Math.random() * (CONFIG.opacityMax - CONFIG.opacityMin) + CONFIG.opacityMin;
            this.speed = Math.random() * (CONFIG.maxSpeed - CONFIG.minSpeed) + CONFIG.minSpeed;
            this.hue = Math.random() * 360; // ランダムな色相（0～360度）

            // 進行方向（角度）の初期化
            this.angle = Math.random() * Math.PI * 2;
            this.targetAngle = this.angle; // 目標とする進路
            
            // 進路変更の滑らかさ（個体差）
            this.turnSpeed = Math.random() * (CONFIG.turnSpeedMax - CONFIG.turnSpeedMin) + CONFIG.turnSpeedMin;

            this.setNextChange();
        }

        // 次に進路を変えるタイミングをセット
        setNextChange() {
            const interval = Math.random() * (CONFIG.changeIntervalMax - CONFIG.changeIntervalMin) + CONFIG.changeIntervalMin;
            this.nextChange = Date.now() + interval;
        }

        // 状態の更新
        update() {
            const now = Date.now();

            // 定期的な進路変更のチェック
            if (now > this.nextChange) {
                this.targetAngle = Math.random() * Math.PI * 2;
                this.setNextChange();
            }

            // 現在の角度を目標角度へ少しずつ近づける（スムーズな旋回）
            let angleDiff = this.targetAngle - this.angle;
            // 最短距離で回転するための正規化
            while (angleDiff < -Math.PI) angleDiff += Math.PI * 2;
            while (angleDiff > Math.PI) angleDiff -= Math.PI * 2;
            this.angle += angleDiff * this.turnSpeed;

            // 計算した角度に基づいて移動（直線的な推進力）
            this.x += Math.cos(this.angle) * this.speed;
            this.y += Math.sin(this.angle) * this.speed;

            // 画面外に出た場合のループ処理（反対側から出す）
            if (this.x > width) this.x = 0;
            else if (this.x < 0) this.x = width;

            if (this.y > height) this.y = 0;
            else if (this.y < 0) this.y = height;
        }

        // 描画処理
        draw() {
            ctx.fillStyle = `hsl(${this.hue}, ${CONFIG.saturation}%, ${CONFIG.lightness}%, ${this.alpha})`;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    // 星の生成
    const stars = Array.from({ length: CONFIG.starCount }, () => new Star());

    // アニメーションの無限ループ
    function animate() {
        // 前のフレームをクリア
        ctx.clearRect(0, 0, width, height);

        // すべての星を更新して描画
        for (let i = 0; i < stars.length; i++) {
            stars[i].update();
            stars[i].draw();
        }

        // 次の描画フレームを予約
        requestAnimationFrame(animate);
    }

    // アニメーション開始
    animate();
})();
