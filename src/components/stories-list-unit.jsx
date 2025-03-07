import Link from 'next/link';

export default function StoriesListUnit({ story }) {
    return (
        <div className="flex h-48 justify-start bg-white mx-2 mb-4 my-2 rounded-lg px-2 py-2">
            <img src={story.coverURL} className="w-1/2 mr-2"/>
            <div className="w-full y-full">
                <h3 className="font-bold flex"> {story.title}</h3>
                <p className="py-2 text-sm">Last updated: 02-24-2025</p>
                <Link href={"/stories/" + story.storyId} className="text-blue-500 text-sm py-1 border border-2 p-2 rounded-lg border-blue-500 flex">
                    Открыть
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M11.2931 15.7672C11.0074 16.0672 10.5327 16.0788 10.2328 15.7931C9.93281 15.5074 9.92123 15.0327 10.2069 14.7328L14 10.75L4.25 10.75C3.83579 10.75 3.5 10.4142 3.5 10C3.5 9.58579 3.83579 9.25 4.25 9.25L14 9.25L10.2069 5.26724C9.92123 4.9673 9.93281 4.49256 10.2328 4.2069C10.5327 3.92123 11.0074 3.93281 11.2931 4.23276L16.2931 9.48276C16.569 9.77242 16.569 10.2276 16.2931 10.5172L11.2931 15.7672Z" fill="#3B82F6"/>
                    </svg>

                </Link>
            </div>
        </div>
    );
}