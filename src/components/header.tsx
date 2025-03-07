export default function Header() {
    return (
        <header className="flex  items-center p-4 bg-white w-full flex justify-end">
            <nav className="flex gap-4">
                <a href="#" className="text-sm font-medium hover:text-gray-600 flex items-center">
                    Вход
                </a>
                <button className="bg-blue-500 hover:bg-blue-700 text-sm text-white py-2 px-2 rounded-full">
                    Регистрация
                </button>                
            </nav>
        </header>
    );
}