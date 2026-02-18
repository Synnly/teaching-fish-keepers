import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { MemoryRouter } from "react-router-dom";
import AdminEventsPage from "../../../src/pages/AdminEventsPage";
import * as eventsApi from "../../../src/api/events";

const originalConfirm = window.confirm;
const confirmMock = vi.fn();

describe("AdminEventsPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    window.confirm = confirmMock;
  });

  afterEach(() => {
    window.confirm = originalConfirm;
    vi.restoreAllMocks();
  });

  it("renders loading state initially", async () => {
    vi.spyOn(eventsApi, "listEvents").mockReturnValue(new Promise(() => {}));

    render(
      <MemoryRouter>
        <AdminEventsPage />
      </MemoryRouter>,
    );

    expect(screen.getByText("Chargement...")).toBeInTheDocument();
  });

  it("renders events list", async () => {
    const mockEvents = [
      {
        id: 1,
        title: "Event 1",
        date: "2023-01-01T10:00:00Z",
        location: "Loc 1",
        description: "desc",
        image_url: null,
        max_participants: 10,
        end_date: null,
        created_at: "2023-01-01T10:00:00Z",
        updated_at: "2023-01-01T10:00:00Z",
      },
      {
        id: 2,
        title: "Event 2",
        date: "2023-01-02T10:00:00Z",
        location: "Loc 2",
        description: "desc",
        image_url: null,
        max_participants: 10,
        end_date: null,
        created_at: "2023-01-02T10:00:00Z",
        updated_at: "2023-01-02T10:00:00Z",
      },
    ];
    vi.spyOn(eventsApi, "listEvents").mockResolvedValue(mockEvents);

    render(
      <MemoryRouter>
        <AdminEventsPage />
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(screen.getByText("Event 1")).toBeInTheDocument();
      expect(screen.getByText("Event 2")).toBeInTheDocument();
    });
  });

  it("shows empty message when no events", async () => {
    vi.spyOn(eventsApi, "listEvents").mockResolvedValue([]);

    render(
      <MemoryRouter>
        <AdminEventsPage />
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(
        screen.getByText("Aucun événement pour le moment."),
      ).toBeInTheDocument();
    });
  });

  it("calls deleteEvent when delete (and confirmed)", async () => {
    const mockEvents = [
      {
        id: 1,
        title: "Event 1",
        date: "2023-01-01T10:00:00Z",
        location: "Loc 1",
        description: "",
        image_url: null,
        max_participants: null,
        end_date: null,
        created_at: "2023-01-01T10:00:00Z",
        updated_at: "2023-01-01T10:00:00Z",
      },
    ];
    vi.spyOn(eventsApi, "listEvents").mockResolvedValue(mockEvents);
    const deleteSpy = vi
      .spyOn(eventsApi, "deleteEvent")
      .mockResolvedValue(undefined);
    confirmMock.mockReturnValue(true);

    render(
      <MemoryRouter>
        <AdminEventsPage />
      </MemoryRouter>,
    );

    await waitFor(() =>
      expect(screen.getByText("Event 1")).toBeInTheDocument(),
    );

    const deleteBtn = screen.getByText("Supprimer");
    fireEvent.click(deleteBtn);

    expect(confirmMock).toHaveBeenCalled();
    expect(deleteSpy).toHaveBeenCalledWith(1);
  });

  it("does not delete if not confirmed", async () => {
    const mockEvents = [
      {
        id: 1,
        title: "Event 1",
        date: "2023-01-01T10:00:00Z",
        location: "Loc 1",
        description: "",
        image_url: null,
        max_participants: null,
        end_date: null,
        created_at: "2023-01-01T10:00:00Z",
        updated_at: "2023-01-01T10:00:00Z",
      },
    ];
    vi.spyOn(eventsApi, "listEvents").mockResolvedValue(mockEvents);
    const deleteSpy = vi.spyOn(eventsApi, "deleteEvent");
    confirmMock.mockReturnValue(false);

    render(
      <MemoryRouter>
        <AdminEventsPage />
      </MemoryRouter>,
    );

    await waitFor(() =>
      expect(screen.getByText("Event 1")).toBeInTheDocument(),
    );

    fireEvent.click(screen.getByText("Supprimer"));

    expect(confirmMock).toHaveBeenCalled();
    expect(deleteSpy).not.toHaveBeenCalled();
  });
});
