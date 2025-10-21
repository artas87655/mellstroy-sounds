// Звуковая панель Mellstroy - ОПТИМИЗИРОВАННАЯ
document.addEventListener('DOMContentLoaded', function() {
    console.log('Скрипт запущен!');
    
    const soundBoard = {
        sounds: new Map(),
        currentlyPlaying: null,
        audioContext: null,
        
        // МАССИВ С НАЗВАНИЯМИ МЕМОВ
        memeNames: [
            "амамам",
            "сливыы", 
            "сколькоо?",
            "радуется",
			"бэмбэмбэм",
            "что за бизнэс remix",
            "что за бизнэс",
            "легендарный звук доната ",
            "да да нет нет remix ", 
            " ёще не придумал ",
            " ещё не придумал",
            " еще не придумал"
        ],
        
        init() {
            console.log('Инициализация звуковой панели...');
            this.setupAudioContext();
            this.createSoundPanels();
            this.setupEventListeners();
            console.log('Инициализация завершена');
        },
        
        // Создаем AudioContext для лучшего управления звуком
        setupAudioContext() {
            try {
                this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            } catch (e) {
                console.warn('AudioContext не поддерживается:', e);
            }
        },
        
        // Создаем панели для звуков
        createSoundPanels() {
            const soundsContainer = document.getElementById('sounds-container');
            
            if (!soundsContainer) {
                console.error('Не найден контейнер для звуков!');
                return;
            }
            
            // Используем DocumentFragment для быстрой вставки
            const fragment = document.createDocumentFragment();
            
            for (let i = 1; i <= 12; i++) {
                const soundId = `sound${i}`;
                const filename = `sounds${i}.mp3`;
                const memeName = this.memeNames[i-1] || `Мем ${i}`;
                
                const panel = this.createSoundPanel(soundId, filename, memeName);
                fragment.appendChild(panel);
                
                // Откладываем предзагрузку для оптимизации
                setTimeout(() => {
                    this.preloadSound(soundId, filename);
                }, i * 100); // Загружаем с задержкой
            }
            
            soundsContainer.appendChild(fragment);
            console.log('Создано 12 звуковых панелей');
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
            
            // Делегирование событий для оптимизации
            const playBtn = panel.querySelector('.play-btn');
            const downloadBtn = panel.querySelector('.download-btn');
            
            playBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.playSound(soundId, panel, filename);
            });
            
            downloadBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.downloadSound(filename, title);
            });
            
            return panel;
        },
        
        // Предзагрузка звука с оптимизацией
        preloadSound(soundId, filename) {
            const audio = new Audio();
            audio.src = `./sounds/${filename}`;
            audio.preload = 'metadata'; // Только метаданные для экономии трафика
            
            const onLoaded = () => {
                console.log(`✅ Звук загружен: ${filename}`);
                this.updateStatus(soundId, '✅ Готов');
                this.sounds.set(soundId, audio);
                // Убираем обработчики после загрузки
                audio.removeEventListener('loadeddata', onLoaded);
                audio.removeEventListener('error', onError);
            };
            
            const onError = (e) => {
                console.error(`❌ Ошибка загрузки: ${filename}`, e);
                this.updateStatus(soundId, '❌ Файл не найден');
                audio.removeEventListener('loadeddata', onLoaded);
                audio.removeEventListener('error', onError);
            };
            
            audio.addEventListener('loadeddata', onLoaded, { once: true });
            audio.addEventListener('error', onError, { once: true });
        },
        
        // Воспроизведение звука с оптимизацией
        async playSound(soundId, panel, filename) {
            // Останавливаем текущий звук
            this.stopCurrentSound();
            
            const audio = this.sounds.get(soundId);
            
            if (!audio) {
                console.error(`Звук не найден: ${soundId}`);
                this.updateStatus(soundId, '❌ Ошибка');
                return;
            }
            
            // Устанавливаем громкость
            const volume = document.getElementById('volume').value;
            audio.volume = volume;
            
            // Сбрасываем на начало
            audio.currentTime = 0;
            
            try {
                // Восстанавливаем AudioContext если нужно
                if (this.audioContext && this.audioContext.state === 'suspended') {
                    await this.audioContext.resume();
                }
                
                // Воспроизводим
                await audio.play();
                
                this.currentlyPlaying = audio;
                this.setPlayingState(panel, true);
                this.updateStatus(soundId, '🔴 Играет...');
                
                // Обработчик окончания
                const onEnded = () => {
                    this.setPlayingState(panel, false);
                    this.updateStatus(soundId, '✅ Готов');
                    this.currentlyPlaying = null;
                    audio.removeEventListener('ended', onEnded);
                };
                
                audio.addEventListener('ended', onEnded, { once: true });
                
            } catch (error) {
                console.error('Ошибка воспроизведения:', error);
                this.updateStatus(soundId, '❌ Ошибка');
            }
        },
        
        // Скачивание звука
        downloadSound(filename, title) {
            const soundUrl = `./sounds/${filename}`;
            const link = document.createElement('a');
            link.href = soundUrl;
            link.download = `${title}.mp3`;
            link.style.display = 'none';
            
            document.body.appendChild(link);
            link.click();
            
            // Удаляем ссылку после скачивания
            setTimeout(() => {
                document.body.removeChild(link);
            }, 100);
        },
        
        // Остановка текущего звука
        stopCurrentSound() {
            if (this.currentlyPlaying) {
                this.currentlyPlaying.pause();
                this.currentlyPlaying.currentTime = 0;
                this.currentlyPlaying = null;
                
                // Сбрасываем все панели
                document.querySelectorAll('.sound-panel.playing').forEach(panel => {
                    this.setPlayingState(panel, false);
                });
            }
        },
        
        // Установка состояния воспроизведения
        setPlayingState(panel, isPlaying) {
            panel.classList.toggle('playing', isPlaying);
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
                // Используем requestAnimationFrame для плавности
                let rafId;
                volumeSlider.addEventListener('input', (e) => {
                    if (rafId) cancelAnimationFrame(rafId);
                    
                    rafId = requestAnimationFrame(() => {
                        const value = Math.round(e.target.value * 100);
                        volumeValue.textContent = `${value}%`;
                        
                        if (this.currentlyPlaying) {
                            this.currentlyPlaying.volume = e.target.value;
                        }
                    });
                });
            }
            
            // Кнопка остановки всех звуков
            const stopBtn = document.getElementById('stop-all');
            if (stopBtn) {
                stopBtn.addEventListener('click', () => {
                    this.stopCurrentSound();
                });
            }
            
            // Оптимизация скролла
            this.setupSmoothScrolling();
        },
        
        // Плавный скролл
        setupSmoothScrolling() {
            document.querySelectorAll('a[href^="#"]').forEach(link => {
                link.addEventListener('click', function(e) {
                    e.preventDefault();
                    const target = document.querySelector(this.getAttribute('href'));
                    if (target) {
                        target.scrollIntoView({ behavior: 'smooth' });
                    }
                });
            });
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
    
    // Оптимизация для мобильных
    if ('ontouchstart' in window) {
        document.documentElement.style.touchAction = 'manipulation';
    }
});
