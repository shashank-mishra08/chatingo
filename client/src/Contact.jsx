import Avatar from "./Avatar.jsx";
import {useTheme} from "./ThemeContext.jsx";

export default function Contact({id,username,onClick,selected,online}) {
  const {theme} = useTheme();
  return (
    <div key={id} onClick={() => onClick(id)}
         className={"border-b flex items-center gap-2 cursor-pointer " + (selected ? (theme === 'light' ? 'bg-blue-50' : 'bg-gray-600') : '') + (theme === 'light' ? 'border-gray-100' : 'border-gray-600')}>
      {selected && (
        <div className="w-1 bg-blue-500 h-12 rounded-r-md"></div>
      )}
      <div className="flex gap-2 py-2 pl-4 items-center">
        <Avatar online={online} username={username} userId={id} />
        <span className={(theme === 'light' ? 'text-gray-800' : 'text-gray-200')}>{username}</span>
      </div>
    </div>
  );
}