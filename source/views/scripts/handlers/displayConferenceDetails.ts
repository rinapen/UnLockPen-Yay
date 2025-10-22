import { joinCall, generateUserUUIDs } from '../agora/joinCall';
import { ConferenceCall } from '../agora/types';
import { switchToJoinedViewUI } from '../utils/rtm';
import { participantManager } from '../ui/participantDisplay';
import { NotificationManager } from '../utils/notificationManager';


let result: HTMLElement | null = null;
let idInput: HTMLInputElement;
let searchButton: HTMLButtonElement;
let idTypeHidden: HTMLInputElement;
let botTypeHidden: HTMLInputElement;
let joinButtonListenerSet = false;

export function displayConferenceDetails(conference: ConferenceCall): void {
  // result要素を取得（存在しない場合は作成）
  if (!result) {
    result = document.getElementById('result');
    if (!result) {
      console.error('result要素が見つかりません');
      return;
    }
  }

  // 外部ユーザー情報を参加者表示に設定
  const externalUserIds = conference.conference_call_users.map(user => user.id.toString());
  participantManager.setExternalUsers(externalUserIds);
  participantManager.show();

  const availableSlots = conference.max_participants - conference.conference_call_users_count;

  result.innerHTML = `
    <div class="conference-card neon-panel card mt-4 p-3">
      <div class="conference-header mb-3 d-flex justify-content-between align-items-center">
        <h5 class="text-cyber m-0">通話詳細</h5>
        <span class="badge bg-cyber-secondary">
          ${conference.conference_call_users_count} / ${conference.max_participants}
        </span>
      </div>

      <p class="mb-2 text-white"><strong>ID:</strong> ${conference.id}</p>
      <h6 class="mb-3 text-cyber">参加者一覧</h6>

      <div class="user-list mb-3">
        ${conference.conference_call_users.map(user => {
          const role = conference.conference_call_user_roles.find(r => r.user_id === user.id)?.role;
          const roleBadge = role === 'host'
            ? `<span class="badge bg-pink ms-2">枠主</span>`
            : role === 'moderator'
              ? `<span class="badge bg-blue ms-2">サブ枠主</span>`
              : '';

          const onlineBadge = user.online_status === "online"
            ? `<span class="badge bg-green ms-auto">オンライン</span>`
            : `<span class="badge bg-gray ms-auto">オフライン</span>`;

          return `
            <div class="participant-item d-flex align-items-center py-2 border-bottom">
              <img src="${user.profile_icon_thumbnail}" class="participant-avatar me-2 rounded" alt="${user.nickname}">
              <div class="flex-grow-1">
                <div class="text-white fw-semibold text-truncate">${user.nickname}</div>
                <div class="d-flex gap-2">
                  ${roleBadge}
                  ${onlineBadge}
                </div>
              </div>
            </div>
          `;
          
          
        }).join('')}
      </div>

      <div class="mb-3">
        <label for="participantCount" class="form-label text-cyber">BOT参加人数</label>
        <select id="participantCount" class="form-select neon-select w-100">
          ${Array.from({ length: availableSlots }, (_, i) => `<option value="${i + 1}">${i + 1}人</option>`).join('')}
        </select>
      </div>

      <div class="text-end">
        <button id="joinButton" class="btn btn-cyber px-4" type="button">
          <i class="fas fa-user-plus me-1"></i> 参加する
        </button>
      </div>
    </div>
  `;

  document.getElementById('joinButton')?.addEventListener('click', async () => {
    await handleJoinClick(conference.id, conference);
  });
}

async function handleJoinClick(conference_call_id: string, conference: ConferenceCall): Promise<void> {
  const notificationManager = NotificationManager.getInstance();
  
  try {
    const participantCountElement = document.getElementById('participantCount') as HTMLSelectElement;
    const selectedCount = parseInt(participantCountElement.value, 10);
    if (isNaN(selectedCount) || selectedCount <= 0) throw new Error('Invalid participant count selected.');

    const botType = (document.getElementById('botTypeHidden') as HTMLInputElement)?.value || '';
    const botTypeName = getBotTypeName(botType);
    console.log("選択されたbotType:", botType);

    const userUUIDs = generateUserUUIDs(selectedCount);
    let successCount = 0;

    for (const userUUID of userUUIDs) {
      try {
        // ボットタイプに応じて適切なモードを選択
        let mode = 'fuck'; // デフォルト
        
        if (botType === 'music') {
          mode = 'music';
        } else if (botType === 'fuck') {
          mode = 'fuck';
        } else if (botType === 'jaki') {
          mode = 'jaki';
        } else if (botType === 'bankai') {
          mode = 'bankai';
        } else if (botType === 'manabun') {
          mode = 'manabun';
        } else if (botType === 'makino') {
          mode = 'makino';
        } else if (botType === 'gojo') {
          mode = 'gojo';
        } else if (botType === 'wiru') {
          mode = 'wiru';
        } else if (botType === 'eden') {
          mode = 'eden';
        } else if (botType === 'shingeki') {
          mode = 'shingeki';
        } else if (botType === 'kimetsu') {
          mode = 'kimetsu';
        }
        
        console.log("決定されたmode:", mode);
        await joinCall(conference_call_id, mode);
        successCount++;
      } catch (error) {
        console.error('BOT参加エラー:', error);
        notificationManager.showBotJoinError(`BOT ${successCount + 1}の参加に失敗しました`);
      }
    }

    if (successCount > 0) {
      notificationManager.showBotJoinSuccess(`${botTypeName} ${successCount}体`);
    }

    // switchToJoinedViewUI(conference);
  } catch (err) {
    console.error('Error joining conference call:', err);
    notificationManager.showConnectionError('通話への参加に失敗しました');
  }
}

function getBotTypeName(botType: string): string {
  switch (botType) {
    case 'music': return 'MusicBOT';
    case 'fuck': return 'FuckBOT';
    case 'jaki': return 'JakiBOT';
    case 'bankai': return 'BankaiBOT';
    case 'manabun': return 'ManabunBOT';
    case 'makino': return 'MakinoBOT';
    case 'gojo': return 'GojoBOT';
    case 'wiru': return 'WiruBOT';
    case 'eden': return 'EdenBOT';
    case 'shingeki': return 'ShingekiBOT';
    case 'kimetsu': return 'KimetsuBOT';
    default: return 'BOT';
  }
}

function updateSearchButtonState(): void {
  const idValid = /^\d+$/.test(idInput.value);
  const botSelected = !!botTypeHidden.value;
  searchButton.disabled = !(idValid && botSelected);
}

export function setupCyberSelectors() {
  idInput = document.getElementById('idInput') as HTMLInputElement;
  searchButton = document.getElementById('searchButton') as HTMLButtonElement;
  idTypeHidden = document.getElementById('idTypeHidden') as HTMLInputElement;
  botTypeHidden = document.getElementById('botTypeHidden') as HTMLInputElement;

  // 必要な要素が存在するかチェック
  if (!idInput || !searchButton || !idTypeHidden || !botTypeHidden) {
    console.error('必要な要素が見つかりません:', {
      idInput: !!idInput,
      searchButton: !!searchButton,
      idTypeHidden: !!idTypeHidden,
      botTypeHidden: !!botTypeHidden
    });
    return;
  }

  setupChoiceSelector('id-type-choice', 'idTypeHidden', 'user_id');
  setupChoiceSelector('bot-type-choice', 'botTypeHidden', 'kuso');

  const observer = new MutationObserver(() => {
    const isIdTypeSelected = !!idTypeHidden.value;
    if (isIdTypeSelected) idInput.disabled = false;
    updateSearchButtonState();
  });

  observer.observe(idTypeHidden, { attributes: true, attributeFilter: ['value'] });

  const botObserver = new MutationObserver(() => updateSearchButtonState());
  botObserver.observe(botTypeHidden, { attributes: true, attributeFilter: ['value'] });

  idInput.addEventListener('input', updateSearchButtonState);

  // 初期化時にID入力フィールドを有効にする
  if (idTypeHidden.value) {
    idInput.disabled = false;
  }
  
  // 初期状態で検索ボタンの状態を更新
  updateSearchButtonState();
}


function setupChoiceSelector(groupId: string, hiddenId: string, defaultValue: string) {
  const group = document.getElementById(groupId);
  const hiddenInput = document.getElementById(hiddenId) as HTMLInputElement;
  if (!group || !hiddenInput) return;

  const options = group.querySelectorAll('.choice-option');
  
  // デフォルト値を設定
  hiddenInput.value = defaultValue;

  options.forEach(opt => {
    const optionValue = opt.getAttribute('data-value');
    
    // デフォルト値と一致するオプションをアクティブにする
    if (optionValue === defaultValue) {
      opt.classList.add('active');
    }

    opt.addEventListener('click', () => {
      // すべてのオプションからアクティブクラスを削除
      options.forEach(o => o.classList.remove('active'));
      
      // クリックされたオプションをアクティブにする
      opt.classList.add('active');
      
      const val = opt.getAttribute('data-value')!;
      hiddenInput.value = val;
      hiddenInput.setAttribute('value', val); // for MutationObserver to trigger

      updateSearchButtonState();
    });
  });
}