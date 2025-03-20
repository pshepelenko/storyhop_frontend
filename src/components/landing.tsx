export default function Landing() {
    return (
        <div className="px-4 py-0 bg-white text-gray-800 font-sans">
            <h1 className="text-2xl sm:text-4xl font-bold text-center mb-6">
                «Создай свою волшебную историю!»
            </h1>
            <p className="text-center text-lg sm:text-xl mb-8">
                Интерактивные аудиокниги, где ребёнок решает, как развиваются события
            </p>
            <div className="text-center text-gray-700 space-y-4">
                <p className="text-xl sm:text-2xl font-semibold">🎧 Слушай. Выбирай. Твори.</p>
                <p>
                    Добро пожаловать в мир, где каждая история оживает благодаря вашему ребёнку! Наш сервис интерактивных аудиокниг позволяет детям не просто слушать сказки, а становиться их соавторами, выбирая развитие сюжета и даже придумывая собственные повороты.
                </p>
            </div>

            <div className="mt-8 space-y-6">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-800">🔹 Почему дети в восторге?</h2>
                <ul className="list-disc list-inside space-y-2 text-gray-700">
                    <li>
                        <span className="font-semibold">✨ Главный герой – ты!</span> Ребёнок сам определяет ход событий, делая каждую историю уникальной.
                    </li>
                    <li>
                        <span className="font-semibold">📖 Мир, полный приключений:</span> Фэнтези, космос, детективы – у нас есть истории на любой вкус!
                    </li>
                    <li>
                        <span className="font-semibold">🎨 Развитие воображения:</span> Каждое решение требует творчества и помогает детям раскрыть фантазию.
                    </li>
                </ul>
            </div>

            <div className="mt-8 space-y-6">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-800">👨‍👩‍👧‍👦 Почему родители довольны?</h2>
                <ul className="list-disc list-inside space-y-2 text-gray-700">
                    <li>
                        <span className="font-semibold">⏳ Качественный досуг без экранов:</span> Ребёнок погружается в сказочный мир, не зависая в гаджетах.
                    </li>
                    <li>
                        <span className="font-semibold">🧠 Прокачка мышления:</span> Интерактивный формат учит анализировать, принимать решения и видеть последствия.
                    </li>
                    <li>
                        <span className="font-semibold">💡 Развитие речи и уверенности:</span> Дети учатся формулировать мысли, фантазировать и даже придумывать собственные истории.
                    </li>
                    <li>
                        <span className="font-semibold">🔒 Безопасный контент:</span> Только добрые, увлекательные и развивающие сказки, созданные с заботой о детях.
                    </li>
                </ul>
            </div>

            <div className="mt-8 text-center">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-4">🚀 Начни приключение уже сейчас!</h2>
                <p className="text-gray-700 mb-2">
                    Выбери историю, слушай, принимай решения и стань творцом своего сказочного мира!
                </p>
                <p className="text-gray-700 font-bold">
                    20 историй бесплатно для новых пользователей
                </p>
                
            </div>
        </div>
    );
}
