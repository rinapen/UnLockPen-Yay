import { setupBotTypeSelector } from './ui/botTypeSelector';
import { setupIdInputHandler } from './ui/idInputHandler';
import { setupMusicUploadHandler } from './ui/musicUploadHandler';
import { handleSearch } from './handlers/handleSearch';
import { setupCyberSelectors } from './handlers/displayConferenceDetails';
import './pages/joined';
import './pages/search';
import '../css/style.css';

setupBotTypeSelector();
setupIdInputHandler();
setupMusicUploadHandler();

setupCyberSelectors();

document.addEventListener('DOMContentLoaded', () => {
  const searchButton = document.getElementById('searchButton');
  if (searchButton) {
    searchButton.addEventListener('click', () => {
      handleSearch();
    });
  }
});

