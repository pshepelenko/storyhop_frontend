import { useEffect, useState } from "react";

export default function Landing() {
    const [language, setLanguage] = useState<'russian' | 'english'>('russian');

    useEffect(() => {
        const lang = localStorage.getItem('storyLanguage') as 'russian' | 'english' | null;
        setLanguage(lang || 'english');
    }, []);

    const text = {
        russian: {
            title: "Интересный и полезный досуг для вашего ребенка",
            subtitle: "Интерактивные аудиокниги, где ребёнок решает, как развиваются события",
            listenChooseCreate: "🎧 Слушай. Выбирай. Твори.",
            description: `Наш сервис интерактивных аудиокниг позволяет детям становиться соавторами аудиосказок, выбирая варианты развития сюжета.
При этом родители задают ценности, которые будут заложены в истории.
Сервис позволяет использовать сказкотерапию, прорабатывая детские страхи и переживания.`,
            whyKids: "🔹 Почему дети в восторге?",
            hero: "✨ Ребенок - главный герой ",
            heroDesc: "Имя главного героя совпадает с именем ребенка, что позволяет ему легко вжиться в этот образ.",
            world: "📖 Мир, полный приключений:",
            worldDesc: "Фэнтези, космос, детективы – у нас есть истории на любой вкус!",
            control: "🎨 Контроль событий:",
            controlDesc: "Ребенок сам решает, как будет развиваться сюжет.",
            whyParents: "👨‍👩‍👧‍👦 Почему родители довольны?",
            busy: "⏳ Ребенок занят:",
            busyDesc: "Вы получите минимум час свободного времени.",
            imagination: "🧠 Прокачка воображения:",
            imaginationDesc: "В отличие от игр и мультиков, ребенок активно участвует в формировании истории, что развивает его воображение и эмпатию.",
            values: "🛡️📋 Контроль ценностей:",
            valuesDesc: "Родитель устанавливает нарративы, закладываемые в подсознание ребенка.",
            therapy: "🧩 Проработка сложных ситуаций:",
            therapyDesc: "Встроенный механизм сказкотерапии помогает ребенку легче пережить сложные жизненные ситуации (например, развод родителей или переезд в другую страну).",
            startNow: "🚀 Начни приключение уже сейчас!",
            createStory: "Создай историю, слушай, принимай решения и стань творцом своего сказочного мира!",
            freeChapters: "20 глав бесплатно для новых пользователей"
        },
        english: {
            title: "Fun and Useful Leisure for Your Child",
            subtitle: "Interactive audiobooks where your child decides how the story unfolds",
            listenChooseCreate: "🎧 Listen. Choose. Create.",
            description: `Our interactive audiobook service lets children become co-authors of fairy tales by choosing how the story develops.
At the same time, parents set the values that will be embedded in the story.
The service allows for fairy tale therapy, helping children work through fears and worries.`,
            whyKids: "🔹 Why Kids Love It",
            hero: "✨ The Child is the Main Character ",
            heroDesc: "The main character's name matches your child's, making it easy for them to immerse themselves in the story.",
            world: "📖 A World Full of Adventures:",
            worldDesc: "Fantasy, space, detective stories – we have stories for every taste!",
            control: "🎨 Control of the Story:",
            controlDesc: "The child decides how the plot will develop.",
            whyParents: "👨‍👩‍👧‍👦 Why Parents Are Happy",
            busy: "⏳ Your Child is Engaged:",
            busyDesc: "You get at least an hour of free time.",
            imagination: "🧠 Imagination Boost:",
            imaginationDesc: "Unlike games and cartoons, your child actively participates in creating the story, developing imagination and empathy.",
            values: "🛡️📋 Value Control:",
            valuesDesc: "Parents set the narratives that are embedded in the child's subconscious.",
            therapy: "🧩 Working Through Difficult Situations:",
            therapyDesc: "Built-in fairy tale therapy helps children cope with difficult life situations (such as parental divorce or moving to another country).",
            startNow: "🚀 Start your adventure now!",
            createStory: "Create a story, listen, make decisions, and become the creator of your own magical world!",
            freeChapters: "20 chapters free for new users"
        }
    };

    const t = text[language];

    return (
        <div className="px-4 py-0 bg-white text-gray-800 font-sans">
            <h1 className="text-2xl sm:text-4xl font-bold text-center mb-6">
                {t.title}
            </h1>
            <p className="text-center text-lg sm:text-xl mb-8">
                {t.subtitle}
            </p>
            <div className="text-center text-gray-700 space-y-4">
                <p className="text-xl sm:text-2xl font-semibold">{t.listenChooseCreate}</p>
                <p>
                    {t.description.split('\n').map((line, i) => (
                        <span key={i}>{line}<br /></span>
                    ))}
                </p>
            </div>

            <div className="mt-8 space-y-6">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-800">{t.whyKids}</h2>
                <ul className="list-disc list-inside space-y-2 text-gray-700">
                    <li>
                        <span className="font-semibold">{t.hero}</span>{t.heroDesc}
                    </li>
                    <li>
                        <span className="font-semibold">{t.world}</span>{t.worldDesc}
                    </li>
                    <li>
                        <span className="font-semibold">{t.control}</span>{t.controlDesc}
                    </li>
                </ul>
            </div>

            <div className="mt-8 space-y-6">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-800">{t.whyParents}</h2>
                <ul className="list-disc list-inside space-y-2 text-gray-700">
                    <li>
                        <span className="font-semibold">{t.busy}</span>{t.busyDesc}
                    </li>
                    <li>
                        <span className="font-semibold">{t.imagination}</span>{t.imaginationDesc}
                    </li>
                    <li>
                        <span className="font-semibold">{t.values}</span>{t.valuesDesc}
                    </li>
                    <li>
                        <span className="font-semibold">{t.therapy}</span>{t.therapyDesc}
                    </li>
                </ul>
            </div>

            <div className="mt-8 text-center">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-4">{t.startNow}</h2>
                <p className="text-gray-700 mb-2">
                    {t.createStory}
                </p>
                <p className="text-gray-700 font-bold">
                    {t.freeChapters}
                </p>
            </div>
        </div>
    );
}
