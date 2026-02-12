import { render, screen, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import userEvent from "@testing-library/user-event";
import EventFormPage from "../../../src/pages/EventFormPage";
import * as eventsApi from "../../../src/api/events";

const { mockNavigate } = vi.hoisted(() => {
  return { mockNavigate: vi.fn() };
});

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe("EventFormPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders new event form correctly", () => {
    render(
      <MemoryRouter>
        <EventFormPage />
      </MemoryRouter>,
    );

    expect(screen.getByText("Nouvel événement")).toBeInTheDocument();
    expect(screen.getByText("Créer")).toBeInTheDocument();
  });

  it("submits new event", async () => {
    const user = userEvent.setup();
    const createSpy = vi
      .spyOn(eventsApi, "createEvent")
      .mockResolvedValue({
        id: 0,
        title: "",
        description: "",
        date: "",
        end_date: null,
        location: "",
        image_url: null,
        max_participants: null,
        created_at: "",
        updated_at: ""
      });

    render(
      <MemoryRouter>
        <EventFormPage />
      </MemoryRouter>,
    );

    const titleInput = screen.getByLabelText(/Titre \*/i);
    await user.type(titleInput, "New Event");

    const dateInput = screen.getByLabelText(/Date de début \*/i);
    await user.type(dateInput, "2023-10-10T10:00");

    await user.click(screen.getByText("Créer"));

    expect(createSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        title: "New Event",
      }),
    );
    expect(mockNavigate).toHaveBeenCalledWith("/admin");
  });

  it("loads existing event for editing", async () => {
    const mockEvent = {
      id: 123,
      title: "Existing Event",
      description: "Desc",
      date: "2023-10-10T10:00:00.000Z",
      end_date: null,
      location: "Somewhere",
      image_url: null,
      max_participants: 50,
      created_at: "2023-10-10T10:00:00.000Z",
      updated_at: "2023-10-10T10:00:00.000Z",
    };

    vi.spyOn(eventsApi, "getEvent").mockResolvedValue(mockEvent);

    render(
      <MemoryRouter initialEntries={["/admin/events/123/edit"]}>
        <Routes>
          <Route path="/admin/events/:id/edit" element={<EventFormPage />} />
        </Routes>
      </MemoryRouter>,
    );

    expect(screen.getByText("Chargement...")).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.queryByText("Chargement...")).not.toBeInTheDocument();
    });

    expect(screen.getByDisplayValue("Existing Event")).toBeInTheDocument();
    expect(screen.getByText("Modifier l'événement")).toBeInTheDocument();
    expect(screen.getByText("Mettre à jour")).toBeInTheDocument();
  });

  it("submits update for existing event", async () => {
    const user = userEvent.setup();
    const mockEvent = {
      id: 123,
      title: "Existing Event",
      description: "Desc",
      date: "2023-10-10T10:00:00.000Z",
      end_date: null,
      location: "Somewhere",
      image_url: null,
      max_participants: 50,
      created_at: "2023-10-10T10:00:00.000Z",
      updated_at: "2023-10-10T10:00:00.000Z",
    };
    vi.spyOn(eventsApi, "getEvent").mockResolvedValue(mockEvent);
    const updateSpy = vi
      .spyOn(eventsApi, "updateEvent")
      .mockResolvedValue({
        id: 0,
        title: "",
        description: "",
        date: "",
        end_date: null,
        location: "",
        image_url: null,
        max_participants: null,
        created_at: "",
        updated_at: ""
      });

    render(
      <MemoryRouter initialEntries={["/admin/events/123/edit"]}>
        <Routes>
          <Route path="/admin/events/:id/edit" element={<EventFormPage />} />
        </Routes>
      </MemoryRouter>,
    );

    await waitFor(() =>
      expect(screen.getByDisplayValue("Existing Event")).toBeInTheDocument(),
    );

    const titleInput = screen.getByDisplayValue("Existing Event");
    await user.clear(titleInput);
    await user.type(titleInput, "Updated Title");

    await user.click(screen.getByText("Mettre à jour"));

    expect(updateSpy).toHaveBeenCalledWith(
      123,
      expect.objectContaining({
        title: "Updated Title",
      }),
    );
    expect(mockNavigate).toHaveBeenCalledWith("/admin");
  });

  it("handles max_participants input changes correctly", async () => {
    const user = userEvent.setup();
    const createSpy = vi
      .spyOn(eventsApi, "createEvent")
      .mockResolvedValue({
        id: 0,
        title: "",
        description: "",
        date: "",
        end_date: null,
        location: "",
        image_url: null,
        max_participants: null,
        created_at: "",
        updated_at: ""
      });

    render(
      <MemoryRouter>
        <EventFormPage />
      </MemoryRouter>,
    );

    const maxParticipantsInput = screen.getByLabelText(/Participants max/i);
    const titleInput = screen.getByLabelText(/Titre \*/i);
    const dateInput = screen.getByLabelText(/Date de début \*/i);

    await user.type(titleInput, "Test Event");
    await user.type(dateInput, "2023-10-10T10:00");

    await user.type(maxParticipantsInput, "100");
    await user.click(screen.getByText("Créer"));

    expect(createSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        max_participants: 100,
      }),
    );

    createSpy.mockClear();
    await user.clear(maxParticipantsInput);
    await user.click(screen.getByText("Créer"));

    expect(createSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        max_participants: null,
      }),
    );
  });
});
