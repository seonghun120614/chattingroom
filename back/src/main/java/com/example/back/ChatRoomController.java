package com.example.back;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.net.URI;
import java.net.URISyntaxException;
import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/chatroom")
public class ChatRoomController {
	private final ChatRoomRepository chatRoomRepository;

	@GetMapping(
			produces = { "application/json" }
	)
	public ResponseEntity<List<ChatRoom>> guestBooks() {
		List<ChatRoom> res = chatRoomRepository.findAll();
		return ResponseEntity.ok(res);
	}

	@PostMapping(
			consumes = { "text/plain" },
			produces = { "application/json" }
	)
	public ResponseEntity<ChatRoom> guestBook(
			@RequestBody String roomName
	) throws URISyntaxException {
		ChatRoom res = chatRoomRepository.save(new ChatRoom(roomName));
		URI uri = new URI("/api/chatroom/" + res.getId());
		return ResponseEntity.created(uri)
		                     .body(res);
	}
}