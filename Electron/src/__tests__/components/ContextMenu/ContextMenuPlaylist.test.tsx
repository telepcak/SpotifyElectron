import '@testing-library/jest-dom';
import '@testing-library/jest-dom/extend-expect';
import { act, fireEvent, render } from '@testing-library/react';
import ContextMenuPlaylist from 'components/AdvancedUIComponents/ContextMenu/Playlist/ContextMenuPlaylist';
import Global from 'global/global';
import { BrowserRouter } from 'react-router-dom';
import UserType from 'utils/role';
import * as router from 'react-router';
import getMockHeaders from 'utils/mockHeaders';
import { waitFor } from '@testing-library/react';
import * as TokenModule from 'utils/token';

const playlistName = 'playlisttest';
const songName = 'songName';
const userName = 'prueba';
const roleUser = UserType.ARTIST;

const artistMockFetch = {
  name: userName,
  photo: 'photo',
  register_date: 'date',
  password: 'hashpassword',
  stream_history: [songName],
  playlists: [playlistName],
  saved_playlists: [playlistName],
  uploaded_songs: [songName],
};

const playlistDTOMockFetch = {
  name: playlistName,
  photo: 'playlist',
  description: 'des',
  upload_date: 'date',
  owner: userName,
  song_names: [],
};

const navigate = jest.fn();

jest.spyOn(router, 'useNavigate').mockImplementation(() => navigate);

jest.spyOn(TokenModule, 'getTokenUsername').mockReturnValue(userName);
jest.spyOn(TokenModule, 'getTokenRole').mockReturnValue(roleUser);

global.fetch = jest.fn((url: string, options: any) => {
  if (
    url === `${Global.backendBaseUrl}/playlists/${playlistDTOMockFetch.name}`
  ) {
    return Promise.resolve({
      json: () => playlistDTOMockFetch,
      status: 200,
      ok: true,
      headers: getMockHeaders(),
    }).catch((error) => {
      console.log(error);
    });
  }
  if (
    url ===
    `${Global.backendBaseUrl}/users/${artistMockFetch.name}/playlist_names`
  ) {
    return Promise.resolve({
      json: () => [playlistName],
      status: 200,
      ok: true,
      headers: getMockHeaders(),
    }).catch((error) => {
      console.log(error);
    });
  }
  if (options && options.method) {
    if (options.method === 'DELETE') {
      return Promise.resolve({
        json: () => {},
        status: 202,
        ok: true,
      }).catch((error) => {
        console.log(error);
      });
    }
    if (options.method === 'PUT') {
      return Promise.resolve({
        json: () => {},
        status: 204,
        ok: true,
        headers: getMockHeaders(),
      }).catch((error) => {
        console.log(error);
      });
    }
    if (options.method === 'PATCH') {
      return Promise.resolve({
        json: () => {},
        status: 204,
        ok: true,
        headers: getMockHeaders(),
      }).catch((error) => {
        console.log(error);
      });
    }
    if (options.method === 'POST') {
      return Promise.resolve({
        json: () => artistMockFetch,
        status: 201,
        ok: true,
      }).catch((error) => {
        console.log(error);
      });
    }
  }
  // In case the URL doesn't match, return a rejected promise
  return Promise.reject(new Error(`Unhandled URL in fetch mock: ${url}`));
}) as jest.Mock;

beforeAll(() => {
  Object.defineProperty(window, 'electron', {
    value: {
      copyToClipboard: {
        sendMessage: jest.fn(),
      },
    },
    writable: true,
  });
});

test('Render ContextMenuPlaylist', async () => {
  const component = await act(() => {
    return render(
      <BrowserRouter>
        <ContextMenuPlaylist
          playlistName={playlistName}
          owner={artistMockFetch.name}
          handleCloseParent={jest.fn()}
          refreshPlaylistData={jest.fn()}
          refreshSidebarData={jest.fn()}
        />
      </BrowserRouter>,
    );
  });
  expect(component).toBeTruthy();
});

test('ContextMenuPlaylist delete Playlist success', async () => {
  const refreshSidebarDataMock = jest.fn();

  const component = await act(() => {
    return render(
      <BrowserRouter>
        <ContextMenuPlaylist
          playlistName={playlistName}
          owner={artistMockFetch.name}
          handleCloseParent={jest.fn()}
          refreshPlaylistData={jest.fn()}
          refreshSidebarData={refreshSidebarDataMock}
        />
      </BrowserRouter>,
    );
  });

  const deleteButton = component.getByText('Eliminar');
  if (deleteButton) {
    await act(async () => {
      fireEvent.click(deleteButton);
    });
  }

  expect(refreshSidebarDataMock).toHaveBeenCalled();
});

test('ContextMenuPlaylist Add Playlist to Playlist', async () => {
  const refreshSidebarDataMock = jest.fn();

  const component = await act(() => {
    return render(
      <BrowserRouter>
        <ContextMenuPlaylist
          playlistName={playlistName}
          owner={artistMockFetch.name}
          handleCloseParent={jest.fn()}
          refreshPlaylistData={jest.fn()}
          refreshSidebarData={refreshSidebarDataMock}
        />
      </BrowserRouter>,
    );
  });

  const addToOtherPlaylistButton = component.getByText('Añadir a otra lista');
  if (addToOtherPlaylistButton) {
    await act(async () => {
      fireEvent.click(addToOtherPlaylistButton);
    });
  }

  const playlistButton = component.getByText(playlistName);
  if (playlistButton) {
    await act(async () => {
      fireEvent.click(playlistButton);
    });
  }

  expect(component.queryByText('Canciones añadidas')).toBeInTheDocument();
});

test('ContextMenuPlaylist Add Songs Error', async () => {
  const component = await act(() => {
    return render(
      <BrowserRouter>
        <ContextMenuPlaylist
          playlistName={playlistName}
          owner={artistMockFetch.name}
          handleCloseParent={jest.fn()}
          refreshPlaylistData={jest.fn()}
          refreshSidebarData={jest.fn()}
        />
      </BrowserRouter>,
    );
  });

  const addToOtherPlaylistButton = component.getByText('Añadir a otra lista');
  if (addToOtherPlaylistButton) {
    await act(async () => {
      fireEvent.click(addToOtherPlaylistButton);
    });
  }

  const playlistButton = component.getByText(playlistName);
  if (playlistButton) {
    global.fetch = jest.fn(() =>
      Promise.reject(new Error('Failed to add songs')),
    );
    await act(async () => {
      fireEvent.click(playlistButton);
    });
  }

  expect(component.queryByText('Canciones no añadidas')).toBeInTheDocument();
});

test('ContextMenuPlaylist Delete Playlist Success', async () => {
  const refreshSidebarDataMock = jest.fn();

  const component = await act(() => {
    return render(
      <BrowserRouter>
        <ContextMenuPlaylist
          playlistName={playlistName}
          owner={artistMockFetch.name}
          handleCloseParent={jest.fn()}
          refreshPlaylistData={jest.fn()}
          refreshSidebarData={refreshSidebarDataMock}
        />
      </BrowserRouter>,
    );
  });

  const deleteButton = component.getByText('Eliminar');
  if (deleteButton) {
    await act(async () => {
      fireEvent.click(deleteButton);
    });
  }

  await act(async () => {
    await new Promise((resolve) => setTimeout(resolve, 100));
  });

  expect(component.queryByText('Playlist eliminada')).toBeInTheDocument();
});

test('ContextMenuPlaylist Delete Playlist Error', async () => {
  const component = await act(() => {
    return render(
      <BrowserRouter>
        <ContextMenuPlaylist
          playlistName={playlistName}
          owner={artistMockFetch.name}
          handleCloseParent={jest.fn()}
          refreshPlaylistData={jest.fn()}
          refreshSidebarData={jest.fn()}
        />
      </BrowserRouter>,
    );
  });

  global.fetch = jest.fn(() =>
    Promise.reject(new Error('Failed to delete playlist')),
  );

  const deleteButton = component.getByText('Eliminar');
  if (deleteButton) {
    await act(async () => {
      fireEvent.click(deleteButton);
    });
  }

  expect(component.queryByText('Playlist no eliminada')).toBeInTheDocument();
});

test('ContextMenuPlaylist Copy to Clipboard', async () => {
  const component = await act(() => {
    return render(
      <BrowserRouter>
        <ContextMenuPlaylist
          playlistName={playlistName}
          owner={artistMockFetch.name}
          handleCloseParent={jest.fn()}
          refreshPlaylistData={jest.fn()}
          refreshSidebarData={jest.fn()}
        />
      </BrowserRouter>,
    );
  });

  const copyButton = component.getByText('Compartir');
  if (copyButton) {
    await act(async () => {
      fireEvent.click(copyButton);
    });
  }

  expect(
    component.queryByText('Enlace copiado al portapapeles'),
  ).toBeInTheDocument();
});

test('ContextMenuPlaylist Default Case Error', async () => {
  const refreshSidebarDataMock = jest.fn();
  const mockHandleCloseParent = jest.fn();

  global.fetch = jest.fn(() => Promise.reject(new Error('Network error')));

  const { queryByText } = render(
    <BrowserRouter>
      <ContextMenuPlaylist
        playlistName={playlistName}
        owner={artistMockFetch.name}
        handleCloseParent={mockHandleCloseParent}
        refreshPlaylistData={jest.fn()}
        refreshSidebarData={refreshSidebarDataMock}
      />
    </BrowserRouter>,
  );

  await waitFor(() => {
    expect(queryByText('Ha ocurrido un error.')).toBeInTheDocument();
  });
});

test('ContextMenuPlaylist close after action', async () => {
  const refreshSidebarDataMock = jest.fn();
  const mockHandleCloseParent = jest.fn();

  const { getByText } = await act(async () =>
    render(
      <BrowserRouter>
        <ContextMenuPlaylist
          playlistName={playlistName}
          owner={artistMockFetch.name}
          handleCloseParent={mockHandleCloseParent}
          refreshPlaylistData={jest.fn()}
          refreshSidebarData={refreshSidebarDataMock}
        />
      </BrowserRouter>,
    ),
  );

  const deleteButton = getByText('Eliminar');
  if (deleteButton) {
    await act(async () => {
      fireEvent.click(deleteButton);
    });
  }

  expect(mockHandleCloseParent).toHaveBeenCalled();
});
