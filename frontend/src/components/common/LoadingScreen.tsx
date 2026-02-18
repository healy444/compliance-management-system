import './LoadingScreen.css';

const LoadingScreen = () => {
    return (
        <div className="loading-screen">
            <img
                src="/cms-logo-black.png"
                alt="Compliance Management System logo"
                className="loading-screen__logo"
            />
            <div className="loading-screen__text">Loading...</div>
        </div>
    );
};

export default LoadingScreen;
