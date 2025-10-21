// Звуковая панель Mellstroy - С КНОПКОЙ СКАЧИВАНИЯ
document.addEventListener('DOMContentLoaded', function() {
    console.log('Скрипт запущен!');
    
    const soundBoard = {
        sounds: new Map(),
        currentlyPlaying: null,
        
        // МАССИВ С НАЗВАНИЯМИ МЕМОВ - РЕДАКТИРУЙТЕ ЗДЕСЬ!
        memeNames: [
            "Легендарная фраза 1",
            "Смех до слёз", 
            "Реакция на донат",
            "Эпичный крик",
            "Шутка в чате",
            "Удивление",
            "Боевой клич",
            "Приветствие",
            "Прощание", 
            "Мотивация",
            "Троллинг",
            "Цитата дня"
        ],
        
        init() {
            console.log('Инициализация звуковой панели...');
            this.createSoundPanels();
            this.setupEventListeners();
            console.log('Инициализация завершена');
        },
        
        // Создаем панели для звуков
        createSoundPanels() {
            const soundsContainer = document.getElementById('sounds-container');
            
            if (!soundsContainer) {
                console.error('Не найден контейнер для звуков!');
                return;
            }
            
            // Очищаем контейнер
            soundsContainer.innerHTML = '';
            
            // Создаем 12 панелей с кастомными названиями
            for (let i = 1; i <= 12; i++) {
                const soundId = `sound${i}`;
                const filename = `sounds${i}.mp3`;
                
                // Берем названия из массива (если есть) или используем стандартные
                const memeName = this.memeNames[i-1] || `Мем ${i}`;
                
                const panel = this.createSoundPanel(soundId, filename, memeName);
                soundsContainer.appendChild(panel);
                
                // Пытаемся предзагрузить звук
                this.preloadSound(soundId, filename);
            }
            
            console.log('Создано 12 звуковых панелей с кастомными названиями');
        },
        
        // Создание одной панели
        createSoundPanel(soundId, filename, title) {
            const panel = document.createElement('div');
            panel.className = 'sound-panel';
            panel.setAttribute('data-sound', soundId);
            
            panel.innerHTML = `
                <div class="panel-content">
                    <h3>${title}</h3>
                    <div class="sound-info">
                        <div class="sound-filename">${filename}</div>
                        <div class="sound-status" id="status-${soundId}">⚫ Ожидание...</div>
                    </div>
                    <div class="panel-buttons">
                        <button class="play-btn" data-sound="${soundId}">
                            <div class="play-icon">▶</div>
                            Воспроизвести
                        </button>
                        <button class="download-btn" data-filename="${filename}">
                            ⬇️ Скачать
                        </button>
                    </div>
                </div>
            `;
            
            // Обработчик клика на кнопку воспроизведения
            const playBtn = panel.querySelector('.play-btn');
            playBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                console.log(`Клик по панели: ${soundId}`);
                this.playSound(soundId, panel, filename);
            });
            
            // Обработчик клика на кнопку скачивания
            const downloadBtn = panel.querySelector('.download-btn');
            downloadBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.downloadSound(filename, title);
            });
            
            return panel;
        },
        
        // Предзагрузка звука
        preloadSound(soundId, filename) {
            console.log(`Пытаюсь загрузить: sounds/${filename}`);
            
            const audio = new Audio();
            audio.src = `./sounds/${filename}`;
            audio.preload = 'auto';
            
            audio.addEventListener('loadeddata', () => {
                console.log(`✅ Звук загружен: ${filename}`);
                this.updateStatus(soundId, '✅ Готов');
                this.sounds.set(soundId, audio);
            });
            
            audio.addEventListener('error', (e) => {
                console.error(`❌ Ошибка загрузки: ${filename}`, e);
                this.updateStatus(soundId, '❌ Файл не найден');
            });
        },
        
        // Воспроизведение звука
        playSound(soundId, panel, filename) {
            console.log(`Попытка воспроизвести: ${soundId}`);
            
            // Останавливаем текущий звук
            this.stopCurrentSound();
            
            const audio = this.sounds.get(soundId);
            
            if (!audio) {
                console.error(`Звук не найден в памяти: ${soundId}`);
                alert(`Звук ${filename} не загружен. Проверьте папку sounds/`);
                return;
            }
            
            // Устанавливаем громкость
            const volume = document.getElementById('volume').value;
            audio.volume = volume;
            
            // Сбрасываем на начало
            audio.currentTime = 0;
            
            // Воспроизводим
            const playPromise = audio.play();
            
            if (playPromise !== undefined) {
                playPromise.then(() => {
                    console.log(`🎵 Воспроизведение: ${filename}`);
                    this.currentlyPlaying = audio;
                    this.setPlayingState(panel, true);
                    this.updateStatus(soundId, '🔴 Играет...');
                    
                    // Когда звук закончится
                    audio.addEventListener('ended', () => {
                        console.log(`⏹️ Звук завершен: ${filename}`);
                        this.setPlayingState(panel, false);
                        this.updateStatus(soundId, '✅ Готов');
                        this.currentlyPlaying = null;
                    }, { once: true });
                    
                }).catch(error => {
                    console.error('Ошибка воспроизведения:', error);
                    alert(`Ошибка: ${error.message}`);
                    this.updateStatus(soundId, '❌ Ошибка');
                });
            }
        },
        
        // Скачивание звука
        downloadSound(filename, title) {
            const soundUrl = `./sounds/${filename}`;
            
            // Создаем временную ссылку для скачивания
            const link = document.createElement('a');
            link.href = soundUrl;
            link.download = `${title}.mp3`;
            
            // Эмулируем клик для скачивания
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            
            console.log(`⬇️ Скачивание: ${filename}`);
        },
        
        // Остановка текущего звука
        stopCurrentSound() {
            if (this.currentlyPlaying) {
                console.log('Останавливаю текущий звук');
                this.currentlyPlaying.pause();
                this.currentlyPlaying.currentTime = 0;
                this.currentlyPlaying = null;
                
                // Сбрасываем все панели
                document.querySelectorAll('.sound-panel').forEach(panel => {
                    this.setPlayingState(panel, false);
                });
            }
        },
        
        // Установка состояния воспроизведения
        setPlayingState(panel, isPlaying) {
            if (isPlaying) {
                panel.classList.add('playing');
            } else {
                panel.classList.remove('playing');
            }
        },
        
        // Обновление статуса
        updateStatus(soundId, message) {
            const statusElement = document.getElementById(`status-${soundId}`);
            if (statusElement) {
                statusElement.textContent = message;
            }
        },
        
        // Настройка контроля громкости
        setupEventListeners() {
            const volumeSlider = document.getElementById('volume');
            const volumeValue = document.getElementById('volume-value');
            
            if (volumeSlider && volumeValue) {
                volumeSlider.addEventListener('input', (e) => {
                    const value = Math.round(e.target.value * 100);
                    volumeValue.textContent = `${value}%`;
                    
                    if (this.currentlyPlaying) {
                        this.currentlyPlaying.volume = e.target.value;
                    }
                });
            }
            
            // Кнопка остановки всех звуков
            const stopBtn = document.getElementById('stop-all');
            if (stopBtn) {
                stopBtn.addEventListener('click', () => {
                    this.stopCurrentSound();
                });
            }
        }
    };
    
    // Запускаем
    soundBoard.init();
    
    // Горячие клавиши
    document.addEventListener('keydown', (e) => {
        if (e.code === 'Space') {
            e.preventDefault();
            const stopBtn = document.getElementById('stop-all');
            if (stopBtn) stopBtn.click();
        }
    });
});
