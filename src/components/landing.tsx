export default function Landing() {
    return (
        <div className="px-4 py-0 bg-white text-gray-800 font-sans">
            <h1 className="text-2xl sm:text-4xl font-bold text-center mb-6">
                Интересный и полезный досуг для вашего ребенка
            </h1>
            <p className="text-center text-lg sm:text-xl mb-8">
                Интерактивные аудиокниги, где ребёнок решает, как развиваются события
            </p>
            <div className="text-center text-gray-700 space-y-4">
                <p className="text-xl sm:text-2xl font-semibold">🎧 Слушай. Выбирай. Твори.</p>
                <p>
                   Наш сервис интерактивных аудиокниг позволяет детям становиться соавторами аудиосказок, выбирая варианты развития сюжета.
                   <br/>
                    При этом родители задают ценности, которые будут заложены в истории.
                    Сервис позволяет использовать сказкотерапию, прорабатывая детские страхи и переживания.
                </p>
            </div>

            <div className="mt-8 space-y-6">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-800">🔹 Почему дети в восторге?</h2>
                <ul className="list-disc list-inside space-y-2 text-gray-700">
                    <li>
                        <span className="font-semibold">✨ Ребенок - главный герой </span> Имя главного героя совпадает с именем ребенка, что позволяет ему легко вжиться в этот образ.
                    </li>
                    <li>
                        <span className="font-semibold">📖 Мир, полный приключений:</span> Фэнтези, космос, детективы – у нас есть истории на любой вкус!
                    </li>
                    <li>
                        <span className="font-semibold">🎨 Контроль событий:</span> Ребенок сам решает, как будет развиваться сюжет.
                    </li>
                </ul>
            </div>

            <div className="mt-8 space-y-6">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-800">👨‍👩‍👧‍👦 Почему родители довольны?</h2>
                <ul className="list-disc list-inside space-y-2 text-gray-700">
                    <li>
                        <span className="font-semibold">⏳ Ребенок занят:</span> Вы получите минимум час свободного времени.
                    </li>
                    <li>
                        <span className="font-semibold">🧠 Прокачка воображения:</span> В отличие от игр и мультиков, ребенок активно участвует в формировании истории, что развивает его воображение и эмпатию.
                    </li>
                    <li>
                        <span className="font-semibold">🛡️📋 Контроль ценностей:</span> Родитель устанавливает нарративы, закладываемые в подсознание ребенка.
                    </li>
                    <li>
                        <span className="font-semibold">🧩 Проработка сложных ситуаций:</span> Встроенный механиз сказкотерапии помогает ребенку легче пережить сложные жизненные ситуации (например, развод родителей или переезд в другую страну).
                    </li>                    
                </ul>
            </div>

            <div className="mt-8 text-center">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-4">🚀 Начни приключение уже сейчас!</h2>
                <p className="text-gray-700 mb-2">
                    Создай историю, слушай, принимай решения и стань творцом своего сказочного мира!
                </p>
                <p className="text-gray-700 font-bold">
                    20 глав бесплатно для новых пользователей
                </p>
                
            </div>
        </div>
    );
}
